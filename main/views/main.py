#
# Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
#
# This file is part of Representable
# (see http://representable.org).
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
import asyncio
import boto3
import urllib
from urllib.request import urlopen
from django.contrib import messages
from django.http import (
    HttpResponse,
    HttpResponseNotFound,
    HttpResponseRedirect,
    JsonResponse,
    Http404,
)
from django.shortcuts import render, redirect
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DetailView,
)
from django.views import View
from django.contrib.auth.mixins import (
    LoginRequiredMixin,
    UserPassesTestMixin,
    AccessMixin,
)
from django.contrib.auth.views import redirect_to_login
from allauth.account.models import (
    EmailConfirmation,
    EmailAddress,
    EmailConfirmationHMAC,
)
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from django.core.mail import EmailMessage

from allauth.account import adapter
from allauth.account.app_settings import ADAPTER
from allauth.account.forms import LoginForm, SignupForm
from allauth.account.views import LoginView, SignupView
from django.forms import formset_factory
from ..forms import (
    CommunityForm,
    DeletionForm,
    AddressForm,
    RepresentableSignupForm,
    RepresentableLoginForm,
    SubmissionAddDrive,
)
from ..models import (
    CommunityEntry,
    AllowList,
    Membership,
    Organization,
    Address,
    DriveToken,
    Drive,
    State,
    Signature,
    BlockGroup,
    CensusBlock,
    FrequentlyAskedQuestion,
    GlossaryDefinition,
)
from ..choices import STATES
from django.views.generic.edit import FormView
from django.core.serializers import serialize
from django.utils.translation import ugettext as _
from django.utils.translation import (
    activate,
    get_language,
)
from django.urls import reverse, reverse_lazy

# from django.utils.translation import (
#     LANGUAGE_SESSION_KEY,
#     check_for_language,
#     get_language,
#     to_locale,
# )
from shapely.geometry import mapping
from geojson_rewind import rewind
import geojson
import os
import json
import re
import csv
import hmac
import hashlib
import base64
from django.template import loader
import shapely.wkt
import reverse_geocoder as rg
from state_abbrev import us_state_abbrev
from django.contrib.auth.models import Group
from itertools import islice
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
import pandas as pd

from django.conf import settings


# ******************************************************************************#

# must be imported after other models
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.contrib.gis.db.models import Union
from django.contrib.gis.geos import GEOSGeometry


# ******************************************************************************#
# language views

# ******************************************************************************#

# custom mixin redirects to signup page/tab rather than login
class SignupRequiredMixin(AccessMixin):
    """Verify that the current user is authenticated."""

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect_to_login(
                request.get_full_path(),
                "/accounts/signup/",
                self.get_redirect_field_name(),
            )
        return super().dispatch(request, *args, **kwargs)


"""
Documentation: https://docs.djangoproject.com/en/2.1/topics/class-based-views/
"""


# View template for both the signing up and signing in
class RepresentableLoginView(LoginView):
    template_name = "account/signup_login.html"
    login_form = RepresentableLoginForm()
    signup_form = RepresentableSignupForm()
    request = None

    def dispatch(self, request, *args, **kwargs):
        self.request = request
        return super().dispatch(request, *args, **kwargs)

    def form_invalid(self, form):
        self.request.session["invalid_login"] = True
        # if the login prompt is from a redirect
        if "next" in self.request.POST:
            return redirect_to_login(
                self.request.POST["next"], "/accounts/login/", "next"
            )
        else:
            return redirect(self.request.get_full_path())

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["signup_form"] = self.signup_form
        context["login_form"] = self.login_form
        if "invalid_login" in self.request.session:
            context["login_error"] = self.login_form.error_messages[
                "email_password_mismatch"
            ]
            del self.request.session["invalid_login"]

        if "invalid_signup" in self.request.session:
            context["signup_errors"] = self.request.session["invalid_signup"]
            del self.request.session["invalid_signup"]
        return context


class RepresentableSignupView(SignupView):
    template_name = "account/signup_login.html"
    login_form = RepresentableLoginForm()
    signup_form = RepresentableSignupForm()
    request = None

    def dispatch(self, request, *args, **kwargs):
        self.request = request
        return super().dispatch(request, *args, **kwargs)

    def form_invalid(self, form):
        errors = {}
        for error in form.errors:
            errors[error] = form.errors[error]
        self.request.session["invalid_signup"] = errors

        # if the signup is from a redirect
        if "next" in self.request.POST:
            return redirect_to_login(
                self.request.POST["next"], "/accounts/signup/", "next"
            )
        else:
            return redirect(self.request.get_full_path())

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["signup_form"] = self.signup_form
        context["login_form"] = self.login_form
        if "invalid_login" in self.request.session:
            context["login_error"] = self.login_form.error_messages[
                "email_password_mismatch"
            ]
            del self.request.session["invalid_login"]

        if "invalid_signup" in self.request.session:
            context["signup_errors"] = self.request.session["invalid_signup"]
            del self.request.session["invalid_signup"]

        return context


class Index(TemplateView):
    """
    The main view/home page.
    """

    template_name = "main/index.html"

    # Add extra context variables.
    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(
            **kwargs,
        )  # get the default context data

        context["mapbox_key"] = os.environ.get("DISTR_MAPBOX_KEY")
        context["hello"] = _("HELLO")
        return context


# ******************************************************************************#


class About(TemplateView):
    template_name = "main/pages/about.html"


# ******************************************************************************#


class FAQ(TemplateView):
    template_name = "main/pages/faq.html"

    def get(self, request, *args, **kwargs):

        faqs_users = FrequentlyAskedQuestion.objects.filter(type="USER")
        faqs_orgs = FrequentlyAskedQuestion.objects.filter(type="ORGANIZATION")
        return render(
            request,
            self.template_name,
            {"faqs_users": faqs_users, "faqs_orgs": faqs_orgs},
        )


# ******************************************************************************#


class Glossary(TemplateView):
    template_name = "main/pages/glossary.html"

    def get(self, request, *args, **kwargs):

        glossaryterms = GlossaryDefinition.objects.all()
        return render(
            request,
            self.template_name,
            {"glossaryterms": glossaryterms},
        )


# ******************************************************************************#


class Resources(TemplateView):
    template_name = "main/pages/resources.html"


# ******************************************************************************#


class Privacy(TemplateView):
    template_name = "main/pages/privacy.html"


# ******************************************************************************#


class Terms(TemplateView):
    template_name = "main/pages/terms.html"


# ******************************************************************************#


# class Blog(TemplateView):
#     template_name = "main/pages/blog.html"


# ******************************************************************************#


class EntryPreview(TemplateView):
    template_name = "main/entry_preview.html"


class EntryStateSelection(TemplateView):
    template_name = "main/entry_state_selection.html"


# ******************************************************************************#


class StatePage(TemplateView):
    template_name = "main/state.html"

    def get(self, request, abbr, *args, **kwargs):

        state = State.objects.filter(abbr=abbr.upper())
        if not state:
            return HttpResponseRedirect(
                reverse_lazy("main:entry", kwargs={"abbr": abbr})
            )
        drives = state[0].get_drives()
        return render(
            request,
            self.template_name,
            {"state_obj": state[0], "drives": drives},
        )


# ******************************************************************************#
class Review(LoginRequiredMixin, TemplateView):
    template_name = "main/review.html"
    form_class = DeletionForm
    initial = {"key": "value"}

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({"user": self.request.user})
        return initial

    def get_context_data(self, **kwargs):
        form = self.form_class(initial=self.get_initial(), label_suffix="")
        # the polygon coordinates

        user = self.request.user
        approvedList = list()
        # in this case, just get the ones we made
        query = CommunityEntry.objects.filter(user=user)
        comms = []
        # the polygon coordinates
        entryPolyDict = dict()
        for obj in query:
            if (
                obj.census_blocks_polygon == ""
                or obj.census_blocks_polygon is None
                and obj.user_polygon
            ):
                s = "".join(obj.user_polygon.geojson)
            elif obj.census_blocks_polygon:
                s = "".join(obj.census_blocks_polygon.geojson)
            else:
                continue
            comms.append(obj)
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates
        context = {
            "form": form,
            "entry_poly_dict": json.dumps(entryPolyDict),
            "approved": json.dumps(approvedList),
            "communities": comms,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        return context

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, label_suffix="")
        # delete entry if form is valid and entry belongs to current user
        query_error = False
        if form.is_valid():
            query = CommunityEntry.objects.filter(user=self.request.user)
            try:
                entry = query.get(entry_ID=request.POST.get("c_id"))
                entry.delete()
            except Exception:
                query_error = True
        context = self.get_context_data()
        context["query_error"] = query_error
        return render(request, self.template_name, context)


# async def getcommsforreview(query, client):
#     comms = []
#     entryPolyDict = dict()
#     for obj in query:
#         try:
#             await getfroms3(
#                 client, obj, obj.drive, obj.state, comms, entryPolyDict
#             )
#         except Exception:
#             if (
#                 obj.census_blocks_polygon == ""
#                 or obj.census_blocks_polygon is None
#                 and obj.user_polygon
#             ):
#                 s = "".join(obj.user_polygon.geojson)
#             elif obj.census_blocks_polygon:
#                 s = "".join(obj.census_blocks_polygon.geojson)
#             else:
#                 continue
#             comms.append(obj)
#             # add all the coordinates in the array
#             # at this point all the elements of the array are coordinates of the polygons
#             struct = geojson.loads(s)
#             entryPolyDict[obj.entry_ID] = struct.coordinates
#     return entryPolyDict, comms


# async def getfroms3(client, obj, drive, state, comms, entryPolyDict):
#     if drive:
#         folder_name = drive
#     elif not drive and obj.drive:
#         folder_name = obj.drive.slug
#     else:
#         folder_name = state
#     response = client.get_object(
#         Bucket=os.environ.get("AWS_STORAGE_BUCKET_NAME"),
#         Key=str(folder_name) + "/" + obj.entry_ID + ".geojson",
#     )
#     strobject = response["Body"].read().decode("utf-8")
#     mapentry = geojson.loads(strobject)
#     comm = CommunityEntry(
#         entry_ID=obj.entry_ID,
#         comm_activities=mapentry["properties"]["comm_activities"],
#         entry_name=mapentry["properties"]["entry_name"],
#         economic_interests=mapentry["properties"]["economic_interests"],
#         other_considerations=mapentry["properties"]["other_considerations"],
#         cultural_interests=mapentry["properties"]["cultural_interests"],
#     )
#     comm.drive = Drive(name=mapentry["properties"]["drive"])
#     comm.organization = Organization(
#         name=mapentry["properties"]["organization"]
#     )
#     comms.append(comm)
#     entryPolyDict[obj.entry_ID] = mapentry["geometry"]["coordinates"]


def SendPlainEmail(request):
    # user_email_address = EmailAddress.objects.get(
    #     user=self.request.user
    # )
    post_email = request.POST.get("message")
    # user_email_address = "edwardtian2000@gmail.com"

    email = EmailMessage(
        "Your Representable Map",
        "Congratulations! <br> You have mapped your community with Representable. <br> We have attached a copy of your map below.",
        "no-reply@representable.org",
        [post_email],
    )
    email.content_subtype = "html"
    file = request.FILES["generatedpdf"]
    email.attach(file.name, file.read(), file.content_type)

    email.send()
    return HttpResponse("Sent")

class Submission(View):
    template_name = "main/submission.html"

    def post(self, request, *args, **kwargs):
        m_uuid = str(self.kwargs["map_id"])
        if not m_uuid:
            raise Http404
        query = CommunityEntry.objects.filter(entry_ID__startswith=m_uuid)
        if not query:
            raise Http404

        user_map = query[0]
        if user_map.drive:
            state = ""
        else:
            if "abbr" in self.kwargs:
                state = folder_name
            else:
                state = user_map.state

        show_form = self.should_show_form(state=state, entryid=m_uuid, auth=self.request.user.is_authenticated)
        # print(show_form, form_info)

        if(show_form == True):
            form = SubmissionAddDrive(request.POST)
            form.upd(state=state.upper())
            if form.is_valid():
                # print('form is valid', m_uuid, form.cleaned_data['Add a new drive'])
                try:
                    d = Drive.objects.get(id=form.cleaned_data['Add a new drive'])
                    o = d.organization
                    c = CommunityEntry.objects.get(entry_ID=m_uuid)
                    c.drive = d
                    c.organization = o
                    c.admin_approved = True
                    c.save()
                    # print('success')
                except Exception as e:
                    print('fail', e)

        return HttpResponseRedirect(request.path)

    def get(self, request, *args, **kwargs):
        m_uuid = str(self.kwargs["map_id"])
        if not m_uuid:
            raise Http404
        query = CommunityEntry.objects.filter(entry_ID__startswith=m_uuid)
        if not query:
            raise Http404

        # query will have length 1 or database is invalid
        user_map = query[0]

        if user_map.drive:
            folder_name = query[0].drive.slug
            # has_state = False
            # state = ""
            has_state = user_map.state != ""
            state = user_map.state
        else:
            if "abbr" in self.kwargs:
                folder_name = self.kwargs["abbr"]
                has_state = True
                state = folder_name
            else:
                has_state = user_map.state != ""
                state = user_map.state
                folder_name = state

        entryPolyDict = {}

        if (
            user_map.census_blocks_polygon == ""
            or user_map.census_blocks_polygon is None
            and user_map.user_polygon
        ):
            s = "".join(user_map.user_polygon.geojson)
        elif user_map.census_blocks_polygon:
            s = "".join(user_map.census_blocks_polygon.geojson)
        else:
            raise Http404
        map_poly = geojson.loads(s)
        entryPolyDict[m_uuid] = map_poly.coordinates
        comm = user_map

        # get user email address
        if self.request.user.is_authenticated:
            user_email_address = EmailAddress.objects.get(
                user=self.request.user
            )
        else:
            user_email_address = ""

        context = {
            "has_state": has_state,
            "state": state,
            "c": comm,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
            "map_id": m_uuid,
            "email": user_email_address,
        }

        # from thanks view
        context["is_thanks"] = False
        if "thanks" in request.path:
            context["is_thanks"] = True
            has_drive = False
            organization_name = ""
            drive_name = ""
            organization_slug = ""
            if kwargs["drive"]:
                has_drive = True
                drive_slug = self.kwargs["drive"]
                drive = Drive.objects.get(slug=drive_slug)
                drive_name = drive.name
                organization = drive.organization
                organization_name = organization.name
                organization_slug = organization.slug

            if (
                self.request.user.is_authenticated
                and EmailAddress.objects.filter(
                    user=self.request.user, verified=True
                ).exists()
            ):
                context["verified"] = True

            else:

                user_email_confirmation = EmailConfirmationHMAC(
                    email_address=user_email_address
                )

                user_email_confirmation.send(self.request, False)
                context["verified"] = False

            context["drive_slug"] = self.kwargs["drive"]
            context["has_drive"] = has_drive
            context["organization_name"] = organization_name
            context["organization_slug"] = organization_slug
            context["drive_name"] = drive_name

        # if self.request.user.is_authenticated:
        #     if user_map.organization:
        #         context["is_org_admin"] = self.request.user.is_org_admin(
        #             user_map.organization_id
        #         )
        #     if self.request.user == user_map.user:
        #         for a in Address.objects.filter(entry=user_map):
        #             context["street"] = a.street
        #             context["city"] = a.city + ", " + a.state + " " + a.zipcode
        #             context["is_community_author"] = (
        #                 self.request.user == user_map.user
        #             )
        #             comm.user_name = user_map.user_name

        show_form = self.should_show_form(state=context['state'], entryid=context['map_id'], auth=self.request.user.is_authenticated)
        context['show_form'] = show_form
        if(show_form == True):
            context['form'] = SubmissionAddDrive()
            context['form'].upd(state=context['state'].upper())

        return render(request, self.template_name, context)
    def should_show_form(self, state, entryid, auth):
        """
        Req: state = a potential state field, map_id = a potential CommEntryID, auth = whether user is authenticated

        Returns:
            Bool - Whether do display addDrive Form

        Checks the following conditions:
            * User is logged in
            * context['map_id'] points to a valid CommunityEntry
            * that CommunityEntry does not have a drive
            * that CommunityEntry has an associated Address
            * context['state'] exists and is a valid state
            * community was created by the user who is signed in
        """
        if(not auth):
            return False
        try:
            entry = CommunityEntry.objects.get(entry_ID=entryid)
        except:
            return False
        if(entry.drive != None):
            return False
        if(entry.user == self.request.user):
            return False
        try:
            Address.objects.get(entry=entry)
        except:
            return False
        try:
            State.objects.get(abbr=state.upper())
        except:
            return False
        return True

def make_geojson(request, entry):
    map_geojson = serialize(
        "geojson",
        [entry],
        geometry_field="census_blocks_polygon",
        fields=(
            "entry_name",
            "cultural_interests",
            "economic_interests",
            "comm_activities",
            "other_considerations",
            "custom_response",
            "population",
        ),
    )
    gj = geojson.loads(map_geojson)
    gj = rewind(gj)
    del gj["crs"]
    user_map = entry
    if user_map.organization:
        gj["features"][0]["properties"][
            "organization"
        ] = user_map.organization.name
    if user_map.drive:
        gj["features"][0]["properties"]["drive"] = user_map.drive.name
    if request.user.is_authenticated:
        is_org_leader = user_map.organization and (
            request.user.is_org_admin(user_map.organization_id)
        )
        if is_org_leader or request.user == user_map.user:
            gj["features"][0]["properties"]["author_name"] = user_map.user_name
            for a in Address.objects.filter(entry=user_map):
                addy = (
                    a.street + " " + a.city + ", " + a.state + " " + a.zipcode
                )
                gj["features"][0]["properties"]["address"] = addy
    feature = gj["features"][0]
    return feature


# make geojson for state map pages
def make_geojson_for_state_map_page(request, entry):
    map_geojson = serialize(
        "geojson",
        [entry],
        geometry_field="census_blocks_polygon",
        fields=(
            "entry_name",
            "cultural_interests",
            "economic_interests",
            "comm_activities",
            "other_considerations",
            "custom_response",
            "population",
        ),
    )
    gj = geojson.loads(map_geojson)
    gj = rewind(gj)
    del gj["crs"]
    user_map = entry
    if user_map.organization:
        gj["features"][0]["properties"][
            "organization"
        ] = user_map.organization.name
    if user_map.drive:
        gj["features"][0]["properties"]["drive"] = user_map.drive.name

    feature = gj["features"][0]
    return feature


# ******************************************************************************#


class ExportView(TemplateView):
    template = "main/export.html"

    def get(self, request, *args, **kwargs):
        m_uuid = self.request.GET.get("map_id", None)
        if m_uuid:
            query = CommunityEntry.objects.filter(entry_ID__startswith=m_uuid)
            query = query[0]

        if not query:
            context = {
                "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            }
            return render(request, self.template_name, context)

        if "abbr" in self.kwargs:
            folder_name = self.kwargs["abbr"]
        else:
            if query.drive:
                folder_name = query.drive.slug
            else:
                folder_name = query.state
        print(folder_name)

        gj = make_geojson(request, query)

        gs = geojson.dumps(gj)
        if "csv" in request.path:
            # this is the new code -- turns geojson into csv for export
            df = pd.json_normalize(gj)
            comm_csv = df.to_csv()
            response = HttpResponse(comm_csv, content_type="text/csv")
        else:
            response = HttpResponse(gs, content_type="application/json")
        return response


# ******************************************************************************#


class Map(TemplateView):
    template_name = "main/map.html"

    def get_context_data(self, **kwargs):
        state = self.kwargs["state"].lower()
        if not state:
            raise Http404

        # the polygon coordinates
        entryPolyDict = dict()
        try:
            state_obj = State.objects.get(abbr=state.upper())
        except:
            raise Http404
        query = (
            state_obj.submissions.all()
            .defer("census_blocks_polygon_array", "user_polygon")
            .prefetch_related("organization", "drive")
        )
        # state map page --> drives in the state, entries without a drive but with a state
        drives = []
        authenticated = self.request.user.is_authenticated
        print(authenticated)
        # get the polygon from db and pass it on to html
        for obj in query:
            if obj.organization and not obj.admin_approved:
                continue
            if (
                obj.census_blocks_polygon == ""
                or obj.census_blocks_polygon is None
                and obj.user_polygon
            ):
                s = "".join(obj.user_polygon.geojson)
            elif obj.census_blocks_polygon:
                s = "".join(obj.census_blocks_polygon.geojson)
            else:
                continue
            drives.append(obj.drive)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates

        context = {
            "state": state,
            "state_name": state_obj.name,
            "communities": query,
            "drives": drives,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        context["multi_export_link"] = f"/multiexport/{state}"
        return context


# ******************************************************************************#


def s3_geojson_export(s3response, query, request):
    strobject = s3response["Body"].read().decode("utf-8")
    mapentry = geojson.loads(strobject)
    gj = rewind(mapentry)
    if request.user.is_authenticated:
        is_org_leader = query.organization and (
            request.user.is_org_admin(query.organization_id)
        )
        if is_org_leader or request.user == query.user:
            gj["properties"]["author_name"] = query.user_name
            for a in Address.objects.filter(entry=query):
                addy = (
                    a.street + " " + a.city + ", " + a.state + " " + a.zipcode
                )
                gj["properties"]["address"] = addy
    return gj


def make_geojson_for_s3(entry):
    map_geojson = serialize(
        "geojson",
        [entry],
        geometry_field="census_blocks_polygon",
        fields=(
            "entry_name",
            "cultural_interests",
            "economic_interests",
            "comm_activities",
            "other_considerations",
            "custom_response",
            "population",
        ),
    )
    gj = geojson.loads(map_geojson)
    gj = rewind(gj)
    del gj["crs"]
    user_map = entry
    if user_map.organization:
        gj["features"][0]["properties"][
            "organization"
        ] = user_map.organization.name
    else:
        gj["features"][0]["properties"]["organization"] = ""
    if user_map.drive:
        gj["features"][0]["properties"]["drive"] = user_map.drive.name
    else:
        gj["features"][0]["properties"]["drive"] = ""
    if user_map.state:
        gj["features"][0]["properties"]["state"] = user_map.state
    else:
        gj["features"][0]["properties"]["state"] = ""
    feature = gj["features"][0]
    return feature


class EntryView(LoginRequiredMixin, View):
    """
    EntryView displays the form and map selection screen.
    """

    template_name = "main/entry.html"
    community_form_class = CommunityForm
    address_form_class = AddressForm
    initial = {
        "key": "value",
    }

    data = {
        "form-TOTAL_FORMS": "1",
        "form-INITIAL_FORMS": "0",
        "form-MAX_NUM_FORMS": "10",
    }

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({"user": self.request.user})
        return initial

    def get(self, request, abbr=None, *args, **kwargs):
        if not abbr:
            return redirect("/#select")
        else:
            if not any(abbr.upper() in i for i in STATES):
                return redirect("/entry_state_selection")
        comm_form = self.community_form_class(
            initial=self.get_initial(), label_suffix=""
        )
        addr_form = self.address_form_class(
            initial=self.get_initial(), label_suffix=""
        )

        has_token = False
        if kwargs["token"]:
            has_token = True

        address_required = True
        has_drive = False
        organization_name = ""
        organization_id = None
        drive_name = ""
        drive_id = None
        drive_custom_question = ""
        if kwargs["drive"]:
            has_drive = True
            drive_slug = self.kwargs["drive"]
            try:
                drive = Drive.objects.get(slug=drive_slug)
            except:
                raise Http404
            if abbr.upper() != drive.state:
                return redirect("/entry/drive/" + drive.slug + "/" + drive.state.lower())

            drive_name = drive.name
            drive_id = drive.id
            drive_custom_question = drive.custom_question
            drive_custom_question_example = drive.custom_question_example
            organization = drive.organization
            organization_name = organization.name
            organization_id = organization.id
            org_admin = self.request.user.is_org_admin(drive.organization.id)
            on_allowlist = False
            allowlist_q = AllowList.objects.filter(
                organization=drive.organization.id,
                email=self.request.user.email,
            )
            if allowlist_q:
                on_allowlist = True
            if drive.private and not (org_admin or on_allowlist):
                # if someone somehow gets the URL for a private drive,
                # redirect them if they're not an org admin or on the allowlist
                return redirect(reverse_lazy("main:entry"))
            address_required = drive.require_user_addresses

        context = {
            "comm_form": comm_form,
            "addr_form": addr_form,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
            "recaptcha_public": settings.RECAPTCHA_PUBLIC,
            "check_captcha": settings.CHECK_CAPTCHA_SUBMIT,
            "census_key": os.environ.get("CENSUS_API_KEY"),
            "has_token": has_token,
            "has_drive": has_drive,
            "organization_name": organization_name,
            "organization_id": organization_id,
            "drive_name": drive_name,
            "drive_id": drive_id,
            "drive_custom_question": drive_custom_question,
            "drive_custom_question_example": drive_custom_question_example,
            "state": abbr,
            "address_required": address_required,
            "state_obj": State.objects.get(abbr=abbr.upper()),
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        comm_form = self.community_form_class(request.POST, label_suffix="")
        addr_form = self.address_form_class(request.POST, label_suffix="")
        # parse block groups and add to field
        comm_form.data._mutable = True
        block_groups = comm_form.data["block_groups"].split(",")
        if len(block_groups[0]) > 12:
            comm_form.data["block_groups"] = [
                CensusBlock.objects.get_or_create(census_id=bg)[0].id
                for bg in block_groups
            ]
        else:
            comm_form.data["block_groups"] = [
                BlockGroup.objects.get_or_create(census_id=bg)[0].id
                for bg in block_groups
            ]
        comm_form.data._mutable = False
        if comm_form.is_valid():
            recaptcha_response = request.POST.get("g-recaptcha-response")
            url = "https://www.google.com/recaptcha/api/siteverify"
            values = {
                "secret": settings.RECAPTCHA_PRIVATE,
                "response": recaptcha_response,
            }
            data = urllib.parse.urlencode(values)
            data = data.encode("ascii")

            req = urllib.request.Request(url, data)
            response = urlopen(req)
            result = json.load(response)
            """ End reCAPTCHA validation """
            if not result["success"]:
                messages.add_message(
                    request,
                    messages.ERROR,
                    "Invalid reCAPTCHA. Please try again.",
                )
                context = {
                    "comm_form": comm_form,
                    "addr_form": addr_form,
                    "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
                    "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
                }
                return render(request, self.template_name, context)

            entryForm = comm_form.save(commit=False)
            s3 = boto3.resource(
                "s3",
                aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
            )
            if self.kwargs["drive"]:
                drive = Drive.objects.get(slug=self.kwargs["drive"])
                folder_name = self.kwargs["drive"]
                if drive:
                    entryForm.drive = drive
                    entryForm.organization = drive.organization
                    entryForm.private = drive.private

            else:
                folder_name = self.kwargs["abbr"]

            entryForm.state = self.kwargs["abbr"].lower()
            entryForm.state_obj = State.objects.get(
                abbr=self.kwargs["abbr"].upper()
            )
            if entryForm.organization:
                if (
                    self.request.user.is_org_admin(entryForm.organization.id)
                    or not drive.private
                ):
                    entryForm.admin_approved = True
                else:
                    # check if user is on the allowlist
                    allowlist_entry = AllowList.objects.filter(
                        organization=entryForm.organization.id,
                        email=self.request.user.email,
                    )
                    if allowlist_entry:
                        # approve this entry
                        entryForm.admin_approved = True
            gj = make_geojson_for_s3(entryForm)

            s3.Bucket(os.environ.get("AWS_STORAGE_BUCKET_NAME")).put_object(
                Body=str(gj),
                Key=f"{folder_name}/{comm_form.data['entry_ID']}.geojson",
                ServerSideEncryption="AES256",
                StorageClass="STANDARD_IA",
            )

            entryForm.save()
            comm_form.save_m2m()

            finalres = dict(
                [
                    (field.name, getattr(entryForm, field.name))
                    for field in entryForm._meta.fields
                ]
            )
            finalres["census_blocks_polygon"] = str(
                entryForm.census_blocks_polygon
            )
            finalres["user"] = entryForm.user.email
            if entryForm.organization:
                finalres["organization"] = entryForm.organization.name
            if entryForm.drive:
                finalres["drive"] = entryForm.drive.name
            finalres["state_obj"] = finalres["state"]
            del finalres["admin_approved"]

            string_to_hash = str(finalres)

            addres = dict()
            if addr_form.is_valid():
                addrForm = addr_form.save(commit=False)
                addrForm.entry = entryForm
                addrForm.save()

                addres = dict(
                    [
                        (field.name, getattr(addrForm, field.name))
                        for field in addrForm._meta.fields
                    ]
                )
                del addres["id"]
                finalres.update(addres)
                string_to_hash = str(finalres)

            digest = hmac.new(
                bytes(os.environ.get("AUDIT_SECRET"), encoding="utf8"),
                msg=bytes(string_to_hash, encoding="utf8"),
                digestmod=hashlib.sha256,
            ).digest()
            signature = base64.b64encode(digest).decode()
            sign_obj = Signature(entry=entryForm, hash=signature)
            sign_obj.save()

            m_uuid = str(entryForm.entry_ID)
            if not entryForm.drive:
                self.success_url = reverse_lazy(
                    "main:submission_thanks",
                    kwargs={"map_id": m_uuid, "abbr": folder_name},
                )
            else:
                self.success_url = reverse_lazy(
                    "main:submission_thanks",
                    kwargs={
                        "map_id": m_uuid,
                        "slug": entryForm.organization.slug,
                        "drive": entryForm.drive.slug,
                    },
                )
            return HttpResponseRedirect(self.success_url)
        context = {
            "comm_form": comm_form,
            "addr_form": addr_form,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        return render(request, self.template_name, context)


# ******************************************************************************#

class MultiExportView(TemplateView):
    template = "main/export.html"

    def post(self, request, *args, **kwargs):
        if not self.request.user.is_authenticated:
            return HttpResponseRedirect('%s?next=%s' % (settings.LOGIN_URL, request.path))
        state = self.kwargs["abbr"]
        cois = set(json.loads(request.POST['cois']))
        state_obj = State.objects.get(abbr=state.upper())

        if 'all' not in cois:
            query = (
                state_obj.submissions.filter(entry_ID__in=cois)
                .defer("census_blocks_polygon_array", "user_polygon")
                .prefetch_related("organization", "drive")
            )
        else:
            query = (
                state_obj.submissions.all()
                .defer("census_blocks_polygon_array", "user_polygon")
                .prefetch_related("organization", "drive")
            )

        if not query:
            # TODO: if the query is empty, return something more appropriate
            # than an empty geojson? - jf

            return HttpResponse(
                geojson.dumps({}), content_type="application/json"
            )

        all_gj = []
        for entry in query:
            gj = make_geojson_for_state_map_page(request, entry)
            all_gj.append(gj)

        final = geojson.FeatureCollection(all_gj)
        if kwargs["type"] == "geo":
            print("********", "geo", "********")
            response = HttpResponse(
                geojson.dumps(final), content_type="application/json"
            )
        else:
            print("********", "csv", "********")
            dictform = json.loads(geojson.dumps(final))
            df = pd.DataFrame()
            for entry in dictform["features"]:
                row_dict = entry["properties"].copy()
                row_dict["geometry"] = str(entry["geometry"])
                df = df.append(row_dict, ignore_index=True)
            response = HttpResponse(df.to_csv(), content_type="text/csv")

        return response

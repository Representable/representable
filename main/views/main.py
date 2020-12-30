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
    BlockGroup,
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
import hashlib
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

        faqs_users = FrequentlyAskedQuestion.objects.filter(type='USER')
        faqs_orgs = FrequentlyAskedQuestion.objects.filter(type='ORGANIZATION')
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


class Privacy(TemplateView):
    template_name = "main/pages/privacy.html"


# ******************************************************************************#


class Terms(TemplateView):
    template_name = "main/pages/terms.html"


# ******************************************************************************#


class Blog(TemplateView):
    template_name = "main/pages/blog.html"


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
        client = boto3.client(
            "s3",
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        )
        entryPolyDict, comms = asyncio.run(getcommsforreview(query, client))
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


async def getcommsforreview(query, client):
    comms = []
    entryPolyDict = dict()
    for obj in query:
        try:
            await getfroms3(
                client, obj, obj.drive, obj.state, comms, entryPolyDict
            )
        except Exception:
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
            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates
    return entryPolyDict, comms


async def getfroms3(client, obj, drive, state, comms, entryPolyDict):
    if drive:
        folder_name = drive
    elif not drive and obj.drive:
        folder_name = obj.drive.slug
    else:
        folder_name = state
    response = client.get_object(
        Bucket=os.environ.get("AWS_STORAGE_BUCKET_NAME"),
        Key=str(folder_name) + "/" + obj.entry_ID + ".geojson",
    )
    strobject = response["Body"].read().decode("utf-8")
    mapentry = geojson.loads(strobject)
    comm = CommunityEntry(
        entry_ID=obj.entry_ID,
        comm_activities=mapentry["properties"]["comm_activities"],
        entry_name=mapentry["properties"]["entry_name"],
        economic_interests=mapentry["properties"]["economic_interests"],
        other_considerations=mapentry["properties"]["other_considerations"],
        cultural_interests=mapentry["properties"]["cultural_interests"],
    )
    comm.drive = Drive(name=mapentry["properties"]["drive"])
    comm.organization = Organization(
        name=mapentry["properties"]["organization"]
    )
    comms.append(comm)
    entryPolyDict[obj.entry_ID] = mapentry["geometry"]["coordinates"]


class Submission(TemplateView):
    template_name = "main/submission.html"

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
            has_state = False
            state = ""
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

        client = boto3.client(
            "s3",
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        )
        try:
            s3response = client.get_object(
                Bucket=os.environ.get("AWS_STORAGE_BUCKET_NAME"),
                Key=folder_name + "/" + user_map.entry_ID + ".geojson",
            )
            strobject = s3response["Body"].read().decode("utf-8")
            mapentry = geojson.loads(strobject)
            poly = Polygon(mapentry["geometry"]["coordinates"][0])
            comm = CommunityEntry(
                entry_ID=m_uuid,
                census_blocks_polygon=poly,
                entry_name=mapentry["properties"]["entry_name"],
                comm_activities=mapentry["properties"]["comm_activities"],
                economic_interests=mapentry["properties"][
                    "economic_interests"
                ],
                other_considerations=mapentry["properties"][
                    "other_considerations"
                ],
                cultural_interests=mapentry["properties"][
                    "cultural_interests"
                ],
            )
            if mapentry["properties"]["drive"]:
                comm.drive = Drive(name=mapentry["properties"]["drive"])
            if mapentry["properties"]["organization"]:
                comm.organization = Organization(
                    name=mapentry["properties"]["organization"]
                )
            entryPolyDict[user_map.entry_ID] = mapentry["geometry"][
                "coordinates"
            ]
        except Exception:
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

        context = {
            "has_state": has_state,
            "state": state,
            "c": comm,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
            "map_id": m_uuid,
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

            if EmailAddress.objects.filter(
                user=self.request.user, verified=True
            ).exists():
                context["verified"] = True

            else:
                user_email_address = EmailAddress.objects.get(
                    user=self.request.user
                )

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

        if self.request.user.is_authenticated:
            if user_map.organization:
                context["is_org_admin"] = self.request.user.is_org_admin(
                    user_map.organization_id
                )
            if self.request.user == user_map.user:
                for a in Address.objects.filter(entry=user_map):
                    context["street"] = a.street
                    context["city"] = a.city + ", " + a.state + " " + a.zipcode
                    context["is_community_author"] = (
                        self.request.user == user_map.user
                    )
                    comm.user_name = user_map.user_name

        return render(request, self.template_name, context)


# ******************************************************************************#


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

        client = boto3.client(
            "s3",
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        )
        try:
            try:
                s3response = client.get_object(
                    Bucket=os.environ.get("AWS_STORAGE_BUCKET_NAME"),
                    Key=folder_name + "/" + query.entry_ID + ".geojson",
                )
                gj = s3_geojson_export(s3response, query, request)
            except Exception:
                gj = make_geojson(request, query)
        except Exception:
            msg = "Unable to export the community geojson. Please check again"
            response = HttpResponseNotFound(
                msg, content_type="application/json"
            )

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

        # the polygon coordinates
        entryPolyDict = dict()
        # all communities for display TODO: might need to limit this? or go by state
        org = Organization.objects.get(id=0)
        query = org.submissions.all().prefetch_related("drive")
        drives = []
        # query = (
        #     CommunityEntry.objects.all()
        #     .prefetch_related("drive", "organization")
        #     .filter(organization__id=0)
        # )
        # get the polygon from db and pass it on to html
        for obj in query:
            if not obj.admin_approved:
                continue
            if (
                obj.census_blocks_polygon == ""
                or obj.census_blocks_polygon is None
            ):
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_polygon.geojson)
            drives.append(obj.drive)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates

        context = {
            "communities": query,
            "drives": drives,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
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
        if kwargs["drive"]:
            has_drive = True
            drive_slug = self.kwargs["drive"]
            drive = Drive.objects.get(slug=drive_slug)
            drive_name = drive.name
            drive_id = drive.id
            organization = drive.organization
            organization_name = organization.name
            organization_id = organization.id
            address_required = drive.require_user_addresses

        context = {
            "comm_form": comm_form,
            "addr_form": addr_form,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
            "recaptcha_public": settings.RECAPTCHA_PUBLIC,
            "check_captcha": settings.CHECK_CAPTCHA_SUBMIT,
            "has_token": has_token,
            "has_drive": has_drive,
            "organization_name": organization_name,
            "organization_id": organization_id,
            "drive_name": drive_name,
            "drive_id": drive_id,
            "state": abbr,
            "address_required": address_required,
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        comm_form = self.community_form_class(request.POST, label_suffix="")
        addr_form = self.address_form_class(request.POST, label_suffix="")
        # parse block groups and add to field
        comm_form.data._mutable = True
        block_groups = comm_form.data["block_groups"].split(",")
        comm_form.data["block_groups"] = [
            BlockGroup.objects.get_or_create(census_id=bg)[0].id
            for bg in block_groups
        ]
        comm_form.data._mutable = False
        if comm_form.is_valid():
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
            else:
                folder_name = self.kwargs["abbr"]
                entryForm.state = self.kwargs["abbr"]
            if entryForm.organization:
                if self.request.user.is_org_admin(entryForm.organization.id):
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
                Key=f'{folder_name}/{comm_form.data["entry_ID"]}.geojson',
                ServerSideEncryption="AES256",
                StorageClass="STANDARD_IA",
            )
            entryForm.census_blocks_polygon = ""

            entryForm.save()
            comm_form.save_m2m()

            if addr_form.is_valid():
                addrForm = addr_form.save(commit=False)
                addrForm.entry = entryForm
                addrForm.save()

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

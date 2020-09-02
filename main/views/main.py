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
from django.http import (
    HttpResponse,
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
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from allauth.account.models import (
    EmailConfirmation,
    EmailAddress,
    EmailConfirmationHMAC,
)
from allauth.account import adapter
from allauth.account.app_settings import ADAPTER
from django.forms import formset_factory
from ..forms import (
    CommunityForm,
    DeletionForm,
    AddressForm,
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
)
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


# ******************************************************************************#

# must be imported after other models
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.contrib.gis.db.models import Union
from django.contrib.gis.geos import GEOSGeometry


# ******************************************************************************#
# language views

# ******************************************************************************#

"""
Documentation: https://docs.djangoproject.com/en/2.1/topics/class-based-views/
"""


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


class Privacy(TemplateView):
    template_name = "main/pages/privacy.html"


# ******************************************************************************#


class Terms(TemplateView):
    template_name = "main/pages/terms.html"


# ******************************************************************************#


class Michigan(TemplateView):
    # template_name = "main/michigan.html"
    def get(self, request, *args, **kwargs):
        return redirect("/state/mi/")


# ******************************************************************************#


class Blog(TemplateView):
    template_name = "main/pages/blog.html"


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
        entryPolyDict = dict()

        user = self.request.user
        approvedList = list()
        # in this case, just get the ones we made
        query = CommunityEntry.objects.filter(user=user)
        for obj in query:
            if (
                obj.census_blocks_polygon == ""
                or obj.census_blocks_polygon is None
            ):
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_polygon.geojson)
            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates
        context = {
            "form": form,
            "entry_poly_dict": json.dumps(entryPolyDict),
            "approved": json.dumps(approvedList),
            "communities": query,
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


# ******************************************************************************#


class Submission(TemplateView):
    template_name = "main/submission.html"
    sha = hashlib.sha256()
    NUM_DIGITS = 10

    def get(self, request, *args, **kwargs):
        m_uuid = self.request.GET.get("map_id", None)

        if not m_uuid or not re.match(r"\b[A-Fa-f0-9]{8}\b", m_uuid):
            raise Http404
        query = CommunityEntry.objects.filter(entry_ID__startswith=m_uuid)

        if not query:
            raise Http404

        # query will have length 1 or database is invalid
        user_map = query[0]
        if (
            user_map.census_blocks_polygon == ""
            or user_map.census_blocks_polygon is None
        ):
            s = "".join(user_map.user_polygon.geojson)
        else:
            s = "".join(user_map.census_blocks_polygon.geojson)
        map_poly = geojson.loads(s)
        entryPolyDict = {}
        entryPolyDict[m_uuid] = map_poly.coordinates

        context = {
            "c": user_map,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        for a in Address.objects.filter(entry=user_map):
            context["street"] = a.street
            context["city"] = a.city + ", " + a.state + " " + a.zipcode
        if self.request.user.is_authenticated:
            if user_map.organization:
                context["is_org_admin"] = self.request.user.is_org_admin(
                    user_map.organization_id
                )
            context["is_community_author"] = self.request.user == user_map.user
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
        if not query:
            context = {
                "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            }
            return render(request, self.template_name, context)
        gj = make_geojson(request, query[0])

        response = HttpResponse(
            geojson.dumps(gj), content_type="application/json"
        )
        return response


# ******************************************************************************#


class Map(TemplateView):
    template_name = "main/map.html"

    def get_context_data(self, **kwargs):

        # the polygon coordinates
        entryPolyDict = dict()
        # all communities for display TODO: might need to limit this? or go by state
        query = CommunityEntry.objects.all()
        # get the polygon from db and pass it on to html
        for obj in CommunityEntry.objects.all():
            if not obj.admin_approved:
                continue
            if (
                obj.census_blocks_polygon == ""
                or obj.census_blocks_polygon is None
            ):
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_polygon.geojson)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates

        context = {
            "communities": query,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        return context


# ******************************************************************************#


class Thanks(LoginRequiredMixin, TemplateView):
    template_name = "main/thanks.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        has_drive = False
        organization_name = ""
        drive_name = ""
        if kwargs["drive"]:
            has_drive = True
            drive_slug = self.kwargs["drive"]
            drive = Drive.objects.get(slug=drive_slug)
            drive_name = drive.name
            organization = drive.organization
            organization_name = organization.name

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

            # default_adapter = adapter.get_adapter()

            # default_adapter.send_confirmation_mail(self.request, user_email_confirmation, False)
            # user_email_address.send_confirmation(None, False)

            user_email_confirmation.send(self.request, False)
            context["verified"] = False

        context["map_url"] = self.kwargs["map_id"]
        context["drive"] = self.kwargs["drive"]
        context["has_drive"] = has_drive
        context["organization_name"] = organization_name
        context["drive_name"] = drive_name

        return context


# ******************************************************************************#


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
    success_url = "/thanks/"

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

        comm_form = self.community_form_class(
            initial=self.get_initial(), label_suffix=""
        )
        addr_form = self.address_form_class(
            initial=self.get_initial(), label_suffix=""
        )

        has_token = False
        if kwargs["token"]:
            has_token = True

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

        context = {
            "comm_form": comm_form,
            "addr_form": addr_form,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
            "has_token": has_token,
            "has_drive": has_drive,
            "organization_name": organization_name,
            "organization_id": organization_id,
            "drive_name": drive_name,
            "drive_id": drive_id,
            "state": abbr,
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

            # This returns an array of Django GEOS Polygon types
            polyArray = comm_form.data["census_blocks_polygon_array"]

            if polyArray is not None and polyArray != "":
                polyArray = polyArray.split("|")
                newPolyArr = []
                # union them one at a time- does not work

                for stringPolygon in polyArray:
                    new_poly = GEOSGeometry(stringPolygon, srid=4326)
                    newPolyArr.append(new_poly)

                mpoly = MultiPolygon(newPolyArr)
                polygonUnion = mpoly.unary_union
                polygonUnion.normalize()
                # if one polygon is returned, create a multipolygon
                if polygonUnion.geom_typeid == 3:
                    polygonUnion = MultiPolygon(polygonUnion)

                entryForm.census_blocks_polygon = polygonUnion

            if self.kwargs["drive"]:
                drive = Drive.objects.get(slug=self.kwargs["drive"])
                if drive:
                    entryForm.drive = drive
                    entryForm.organization = drive.organization

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

            entryForm.save()
            comm_form.save_m2m()

            if addr_form.is_valid():
                addrForm = addr_form.save(commit=False)
                addrForm.entry = entryForm
                addrForm.save()

            m_uuid = str(entryForm.entry_ID).split("-")[0]
            if not entryForm.drive:
                self.success_url = reverse_lazy(
                    "main:thanks", kwargs={"map_id": m_uuid}
                )
            else:
                self.success_url = reverse_lazy(
                    "main:thanks",
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

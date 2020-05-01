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
from django.http import HttpResponse, HttpResponseRedirect
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
from allauth.account.decorators import verified_email_required
from django.forms import formset_factory
from ..forms import (
    CommunityForm,
    DeletionForm,
)
from ..models import (
    CommunityEntry,
    Tag,
    Membership,
)
from django.views.generic.edit import FormView
from django.core.serializers import serialize
from django.utils.translation import gettext
from django.urls import reverse, reverse_lazy
from django.utils.translation import (
    LANGUAGE_SESSION_KEY,
    check_for_language,
    get_language,
    to_locale,
)
from shapely.geometry import mapping
import geojson
import os
import json
import re
import csv
import hashlib
from django.http import JsonResponse
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
            **kwargs
        )  # get the default context data

        context["mapbox_key"] = os.environ.get("DISTR_MAPBOX_KEY")
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
class Review(LoginRequiredMixin, TemplateView):
    template_name = "main/pages/review.html"
    form_class = DeletionForm
    initial = {"key": "value"}

    def centroid(self, pt_list):
        if len(pt_list) > 0 and type(pt_list) == list:
            if type(pt_list[0][0]) == list:
                new_list = []
                for x in pt_list:
                    for y in x:
                        new_list.append(y)
                pt_list = new_list
        length = len(pt_list)
        sum_x = sum(
            [x[1] for x in pt_list]
        )  # TODO coords are reversed for some reason?
        sum_y = sum([x[0] for x in pt_list])
        return sum_x / length, sum_y / length

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
        # dictionary of tags to be displayed
        tags = dict()
        for obj in Tag.objects.all():
            # manytomany query
            entries = obj.communityentry_set.all()
            ids = []
            for id in entries:
                ids.append(str(id))
            tags[str(obj)] = ids

        user = self.request.user
        approvedList = list()  # TODO make list?
        if user.is_staff:
            print("Staff")
            query = CommunityEntry.objects.all()
            viewableQuery = list()
            for obj in query:
                if (
                    obj.census_blocks_polygon == ""
                    or obj.census_blocks_polygon is None
                ):
                    s = "".join(obj.user_polygon.geojson)
                else:
                    s = "".join(obj.census_blocks_polygon.geojson)
                struct = geojson.loads(s)
                ct = self.centroid(struct["coordinates"][0])
                # https://github.com/thampiman/reverse-geocoder
                # note that this is an offline reverse geocoding library
                # reverse geocode to see which states this is in
                results = rg.search(ct)
                if len(results) == 0:
                    continue  # skip this community: reverse geocoding failed!
                admins = [y for x, y in results[0].items()]
                # get the states that the object is in

                possib_states = set(
                    [
                        us_state_abbrev[x]
                        for x in us_state_abbrev.keys()
                        if x in admins
                    ]
                )
                # now make sure user is authorized to edit state
                authorized = set(
                    [g.name.upper() for g in user.groups.all()]
                )  # TODO assume all groups are state
                if possib_states.issubset(authorized):
                    print("Authorized for states {}".format(possib_states))
                    # add it to viewable
                    entryPolyDict[obj.entry_ID] = struct.coordinates
                    viewableQuery.append(obj)
                    if obj.admin_approved:
                        # this is for coloring the map properly
                        approvedList.append(obj.entry_ID)
                else:
                    print(type(query))
                    print("Not authorized for states.")
            query = viewableQuery
        else:
            # in this case, just get the ones we made
            query = CommunityEntry.objects.filter(user=self.request.user)
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
                if obj.admin_approved or True:
                    approvedList.append(obj.entry_ID)
        context = {
            "form": form,
            "tags": json.dumps(tags),
            "entries": json.dumps(entryPolyDict),
            "approved": json.dumps(approvedList),
            "communities": query,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
        }
        return context

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, label_suffix="")
        # delete entry if form is valid and entry belongs to current user
        if form.is_valid() and self.request.user.is_staff:
            query = CommunityEntry.objects.filter(
                entry_ID=request.POST.get("c_id")
            )
            if len(query) == 0:
                print("No map found")
            entry = query[0]
            # TODO check whether authorized to edit state?
            if (
                "Approve" in request.POST
            ):  # TODO need someone to review security
                entry.admin_approved = True
                entry.save()
            elif "Unapprove" in request.POST:
                entry.admin_approved = False
                entry.save()
            elif "Delete" in request.POST:
                entry.delete()
        elif form.is_valid():  # not staff, just can delete own entries
            query = CommunityEntry.objects.filter(user=self.request.user)
            entry = query.get(entry_ID=request.POST.get("c_id"))
            entry.delete()

        context = (
            self.get_context_data()
        )  # TODO: Is there a problem with this?
        return render(request, self.template_name, context)


# ******************************************************************************#


class Submission(TemplateView):
    template_name = "main/pages/submission.html"
    sha = hashlib.sha256()
    NUM_DIGITS = 10  # TODO move to some place with constants

    def get(self, request, *args, **kwargs):
        m_uuid = self.request.GET.get("map_id", None)
        # TODO: Are there security risks? Probably - we should hash the UUID and make that the permalink

        if m_uuid is None:
            pass  # TODO need to fix here
        query = CommunityEntry.objects.filter(entry_ID__startswith=m_uuid)

        if len(query) == 0:
            context = {
                "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            }
            return render(request, self.template_name, context)
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
            "entry_name": user_map.entry_name,
            "entry_reason": user_map.entry_reason,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
        }
        return render(request, self.template_name, context)


# ******************************************************************************#


class Map(TemplateView):
    template_name = "main/pages/map.html"

    def get_context_data(self, **kwargs):
        # dictionary of entry names and reasons
        entry_names = dict()
        entry_reasons = dict()

        # the polygon coordinates
        entryPolyDict = dict()
        # dictionary of tags to be displayed
        tags = dict()
        for obj in Tag.objects.all():
            # manytomany query
            entries = obj.communityentry_set.all()
            ids = []
            for id in entries:
                ids.append(str(id))
            tags[str(obj)] = ids
        # get the polygon from db and pass it on to html
        for obj in CommunityEntry.objects.all():
            if not obj.admin_approved:
                continue
            if (
                obj.census_blocks_polygon == ""
                or obj.census_blocks_polygon is None
            ):
                s = "".join(obj.user_polygon.geojson)
                entry_names[str(obj.entry_ID)] = obj.entry_name
                entry_reasons[str(obj.entry_ID)] = obj.entry_reason
            else:
                s = "".join(obj.census_blocks_polygon.geojson)
                entry_names[str(obj.entry_ID)] = obj.entry_name
                entry_reasons[str(obj.entry_ID)] = obj.entry_reason

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates

        context = {
            "entry_names": json.dumps(entry_names),
            "entry_reasons": json.dumps(entry_reasons),
            "tags": json.dumps(tags),
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
        }
        return context


# ******************************************************************************#


class Thanks(TemplateView):
    template_name = "main/pages/thanks.html"

    def get(self, request):
        context = {
            "map_url": request.GET["map_id"],
        }
        return render(request, self.template_name, context)


# ******************************************************************************#


class EntryView(LoginRequiredMixin, View):
    """
    EntryView displays the form and map selection screen.
    """

    template_name = "main/pages/entry.html"
    form_class = CommunityForm
    initial = {
        "key": "value",
        "entry_name": "My local community",  # TODO add es/en versions
        "entry_reason": "This community is brought together by...",
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

    def get(self, request, *args, **kwargs):
        form = self.form_class(initial=self.get_initial(), label_suffix="")
        context = {
            "form": form,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, label_suffix="")
        if form.is_valid():
            print("Entry form is valid")
            tag_name_qs = form.cleaned_data["tags"].values("name")
            entryForm = form.save(commit=False)
            # get all the polygons from the array
            # This returns an array of Django GEOS Polygon types
            polyArray = form.data["census_blocks_polygon_array"]

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

            entryForm.save()
            for tag_name in tag_name_qs:
                tag = Tag.objects.get(name=str(tag_name["name"]))
                entryForm.tags.add(tag)

            m_uuid = str(entryForm.entry_ID).split("-")[0]
            full_url = self.success_url + "?map_id=" + m_uuid
            return HttpResponseRedirect(full_url)
        context = {
            "form": form,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
        }
        return render(request, self.template_name, context)

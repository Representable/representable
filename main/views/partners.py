from ..models import (
    Membership,
    Organization,
    CommunityEntry,
    Drive,
    Address,
)

# from django.views.generic.detail import SingleObjectMixin
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DetailView,
)

import json
import os
import geojson
from django.shortcuts import get_object_or_404
from geojson_rewind import rewind
from django.core.serializers import serialize
from django.http import HttpResponse
from django.shortcuts import render

from .main import make_geojson


class IndexView(ListView):
    model = Organization
    template_name = "main/partners/index.html"
    pk_url_kwarg = "pk"


class PartnerView(DetailView):
    model = Organization
    template_name = "main/partners/page.html"
    pk_url_kwarg = "pk"


class WelcomeView(TemplateView):
    model = Organization
    template_name = "main/partners/get_started.html"
    pk_url_kwarg = "pk"


class PartnerMap(TemplateView):
    template_name = "main/partners/map.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # the polygon coordinates
        entryPolyDict = dict()
        # address Information
        streets = {}
        cities = {}
        # get the polygon from db and pass it on to html
        if self.kwargs["drive"]:
            query = CommunityEntry.objects.filter(
                organization__slug=self.kwargs["slug"],
                drive__slug=self.kwargs["drive"],
                admin_approved=True,
            )
        else:
            query = CommunityEntry.objects.filter(
                organization__slug=self.kwargs["slug"], admin_approved=True
            )
        for obj in query:
            for a in Address.objects.filter(entry=obj):
                streets[obj.entry_ID] = a.street
                cities[obj.entry_ID] = (
                    a.city + ", " + a.state + " " + a.zipcode
                )
            if not obj.census_blocks_polygon:
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_polygon.geojson)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates

        context = {
            "streets": streets,
            "cities": cities,
            "communities": query,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        org = Organization.objects.get(slug=self.kwargs["slug"])
        context["organization"] = org
        context["state"] = org.states[0]
        if not self.kwargs["drive"]:
            context["multi_export_link"] = (
                "/multiexport/org/" + self.kwargs["slug"]
            )

        if self.kwargs["drive"]:
            context["drive"] = get_object_or_404(
                Drive, slug=self.kwargs["drive"]
            ).name
            context["multi_export_link"] = (
                "/multiexport/drive/" + self.kwargs["drive"]
            )
        if self.request.user.is_authenticated:
            context["is_org_admin"] = self.request.user.is_org_admin(
                Organization.objects.get(slug=self.kwargs["slug"]).id
            )
        return context


# ******************************************************************************#


class MultiExportView(TemplateView):
    template = "main/export.html"

    def get(self, request, drive=None, org=None, **kwargs):

        if drive:
            query = CommunityEntry.objects.filter(drive__slug=drive)

        if org:
            query = CommunityEntry.objects.filter(organization__slug=org)

        if not query:
            # TODO: if the query is empty, return something more appropriate
            # than an empty geojson? - jf

            return HttpResponse(
                geojson.dumps({}), content_type="application/json"
            )
        all_gj = []
        for entry in query:
            # map_geojson = serialize(
            #     "geojson",
            #     [entry],
            #     geometry_field="census_blocks_polygon",
            #     fields=(
            #         "entry_name",
            #         "cultural_interests",
            #         "economic_interests",
            #         "comm_activities",
            #         "other_considerations",
            #     ),
            # )
            # gj = geojson.loads(map_geojson)
            # gj = rewind(gj)
            # del gj["crs"]
            # user_map = entry
            # if user_map.organization:
            #     gj["features"][0]["properties"][
            #         "organization"
            #     ] = user_map.organization.name
            # if user_map.drive:
            #     gj["features"][0]["properties"]["drive"] = user_map.drive.name
            # if self.request.user.is_authenticated:
            #     is_org_leader = user_map.organization and (
            #         self.request.user.is_org_admin(user_map.organization_id)
            #     )
            #     if is_org_leader or self.request.user == user_map.user:
            #         gj["features"][0]["properties"][
            #             "author_name"
            #         ] = user_map.user_name
            #         for a in Address.objects.filter(entry=user_map):
            #             addy = (
            #                 a.street
            #                 + " "
            #                 + a.city
            #                 + ", "
            #                 + a.state
            #                 + " "
            #                 + a.zipcode
            #             )
            #             gj["features"][0]["properties"]["address"] = addy
            #             all_gj.append(gj)

            gj = make_geojson(request, entry)
            all_gj.append(gj)

        final = geojson.FeatureCollection(all_gj)
        response = HttpResponse(
            geojson.dumps(final), content_type="application/json"
        )
        return response


# ******************************************************************************#

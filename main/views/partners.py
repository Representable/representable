from ..models import (
    User,
    Membership,
    Organization,
    CommunityEntry,
    Drive,
    Address,
    Report,
)

# from django.views.generic.detail import SingleObjectMixin
from django.views.generic import (
    View,
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
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse_lazy

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
        if self.request.user.is_authenticated:
            email = {
                "exists": True,
                "value": self.request.user.email,
            }
        else:
            email = {
                "exists": False,
                "value": None,
            }
        context["email"] = email
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
            context["drive_slug"] = self.kwargs["drive"]
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
            query = CommunityEntry.objects.filter(
                drive__slug=drive, admin_approved=True
            )

        if org:
            query = CommunityEntry.objects.filter(
                organization__slug=org, admin_approved=True
            )

        if not query:
            # TODO: if the query is empty, return something more appropriate
            # than an empty geojson? - jf

            return HttpResponse(
                geojson.dumps({}), content_type="application/json"
            )
        all_gj = []
        for entry in query:
            if not entry.organization:
                continue
            gj = make_geojson(request, entry)
            all_gj.append(gj)

        final = geojson.FeatureCollection(all_gj)

        response = HttpResponse(
            geojson.dumps(final), content_type="application/json"
        )
        return response


# ******************************************************************************#


class ReportView(View):
    def post(self, request, **kwargs):
        cid = request.POST["cid"]
        email = request.POST["email"]

        user_q = User.objects.filter(email=email)

        org_slug = request.POST["org_slug"].replace("/", "")
        drive_slug = request.POST["drive_slug"].replace("/", "")

        community = CommunityEntry.objects.get(id=cid)
        org = Organization.objects.get(slug=org_slug)

        report = Report(community=community, email=email)
        report.save()

        if user_q:
            user = user_q[0]
            if user.is_org_admin(org.id):
                print("here")
                report.unapprove()

        return HttpResponseRedirect(
            reverse_lazy(
                "main:partner_map",
                kwargs={"slug": org_slug, "drive": drive_slug},
            )
            + "#reportSubmitted"
        )


# ******************************************************************************#

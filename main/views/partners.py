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

import time
import boto3
import botocore
from django.contrib.gis import geos
from django.contrib.gis.geos import  GEOSGeometry, MultiPolygon, Polygon

# from django.contrib.gis.geos import GEOSGeometry
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
        start_time = time.time()
        context = super().get_context_data(**kwargs)

        # the polygon coordinates
        entryPolyDict = dict()
        # address Information
        streets = {}
        cities = {}
        org = Organization.objects.get(slug=self.kwargs["slug"])
        # get the polygon from db and pass it on to html
        if self.kwargs["drive"]:
            drive = Drive.objects.get(slug=self.kwargs["drive"])
            query = drive.submissions.all().defer(
                "census_blocks_polygon_array", "user_polygon"
            )
            
            client = boto3.client('s3', aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"), aws_secret_access_key= os.environ.get("AWS_SECRET_ACCESS_KEY"))
            response = client.get_object(
                Bucket=os.environ.get("AWS_STORAGE_BUCKET_NAME"),
                Key=self.kwargs["drive"]+"/test2str.geojson"
            )
            strobject = response['Body'].read().decode('utf-8')
            mapentry = geojson.loads(strobject)
            print(type(query))
            mapentry['geometry']['type'] = "MultiPolygon"
            # print(mapentry)
            # mapentry.pop('type', None)
            # geom = GEOSGeometry(mapentry['geometry'])
            # geom['type'] = 'MultiPolygon'
            print(f"LEnght of the coorindates: {mapentry['geometry']['coordinates']}")
            poly = Polygon(mapentry['geometry']['coordinates'][0])
            
            # mpoly.mygeom = geos.MultiPolygon(mpoly.mygeom)
            mpoly = MultiPolygon(poly)
            # print(CommunityEntry.objects.create(**mapentry))
            
            comm= CommunityEntry(user_id="4", entry_ID="912478236462", user_name="somya", census_blocks_polygon=mpoly, comm_activities=mapentry["properties"]["comm_activities"],entry_name=mapentry["properties"]["entry_name"], economic_interests=mapentry["properties"]["economic_interests"], other_considerations=mapentry["properties"]["other_considerations"], cultural_interests=mapentry["properties"]["cultural_interests"])
            # query |= CommunityEntry.objects.filter(id=comm.id)
            # print(type(mapentry))

            
            
            # query = CommunityEntry.objects.filter(
            #     organization__slug=self.kwargs["slug"],
            #     drive__slug=self.kwargs["drive"],
            # ).defer(
            #     "census_blocks_polygon_array",
            #     "user_polygon",
            #     "census_blocks_polygon",
            # )
        else:
            query = org.submissions.all().defer(
                "census_blocks_polygon_array", "user_polygon"
            )
            # query = CommunityEntry.objects.filter(
            #     organization__slug=self.kwargs["slug"]
            # ).defer(
            #     "census_blocks_polygon_array",
            #     "user_polygon",
            #     "census_blocks_polygon",
            # )
        for obj in query:
            for a in Address.objects.filter(entry=obj):
                streets[obj.entry_ID] = a.street
                cities[obj.entry_ID] = (
                    a.city + ", " + a.state + " " + a.zipcode
                )
            # if not obj.census_blocks_polygon:
            #     s = "".join(obj.user_polygon.geojson)
            # else:

            #   s = "".join(obj.census_blocks_polygon.geojson)
            s = "".join(obj.census_blocks_polygon.geojson)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            # struct = geojson.loads(s)
            # entryPolyDict[obj.entry_ID] = struct.coordinates

        context = {
            "streets": streets,
            "cities": cities,
            "communities": [comm],
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        # org = Organization.objects.get(slug=self.kwargs["slug"])
        context["organization"] = org
        context["state"] = org.states[0].lower()
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
            context["is_org_admin"] = self.request.user.is_org_admin(org.id)
        print("--- %s seconds MAP TIME---" % (time.time() - start_time))
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
        is_org_admin = request.POST["is_org_admin"]

        org_slug = request.POST["org_slug"].replace("/", "")
        drive_slug = request.POST["drive_slug"].replace("/", "")

        community = CommunityEntry.objects.get(id=cid)

        report = Report(community=community, email=email)
        report.save()

        if is_org_admin == "True":
            report.unapprove()

        return HttpResponseRedirect(
            reverse_lazy(
                "main:partner_map",
                kwargs={"slug": org_slug, "drive": drive_slug},
            )
            + "#reportSubmitted"
        )


# ******************************************************************************#

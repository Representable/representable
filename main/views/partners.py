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

import asyncio
import boto3
import aioboto3
import botocore
import pandas
from django.contrib.gis import geos
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon, Polygon

# from django.contrib.gis.geos import GEOSGeometry
import json
import os
import geojson
import time
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
        actual_start = time.time()

        # the polygon coordinates
        entryPolyDict = dict()
        org = Organization.objects.get(slug=self.kwargs["slug"])
        is_admin = False
        if self.request.user.is_authenticated:
            if self.request.user.is_org_admin(org.id):
                is_admin = True
        # get the polygon from db and pass it on to html
        if self.kwargs["drive"]:
            drive = Drive.objects.get(slug=self.kwargs["drive"])
            query = drive.submissions.all().defer(
                "census_blocks_polygon_array", "user_polygon",
            ).prefetch_related("organization")
        else:
            drive = None
            query = org.submissions.all().defer(
                "census_blocks_polygon_array", "user_polygon"
            ).prefetch_related("drive")

        # address information if admin/user drew the comms
        streets = {}
        cities = {}
        start_time_aws = time.time()
        for obj in query:
            if not obj.census_blocks_polygon and obj.user_polygon:
                s = "".join(obj.user_polygon.geojson)
            elif obj.census_blocks_polygon:
                s = "".join(obj.census_blocks_polygon.geojson)
            else:
                continue
            if is_admin:
                if not obj.user_name:
                    obj.user_name = obj.user.username
            else:
                if obj.user_name:
                    obj.user_name = ""

            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates
            if is_admin:
                for a in Address.objects.filter(entry=obj):
                    streets[obj.entry_ID] = a.street
                    cities[obj.entry_ID] = (
                        a.city + ", " + a.state + " " + a.zipcode
                    )
        
        context = {
            "streets": streets,
            "cities": cities,
            "communities": query,
            "entries": json.dumps(entryPolyDict),
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
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
            map_drive = get_object_or_404(Drive, slug=self.kwargs["drive"])
            context["drive"] = map_drive.name
            context["state"] = map_drive.state.lower()
            context["multi_export_link"] = (
                "/multiexport/drive/" + self.kwargs["drive"]
            )
            context["drive_slug"] = self.kwargs["drive"]
        if self.request.user.is_authenticated:
            context["is_org_admin"] = self.request.user.is_org_admin(org.id)
        print("--- %s seconds for AWS---" % (time.time() - start_time_aws))
        print("--- %s seconds including query---" % (time.time() - actual_start))
        return context


async def getcomms(query, client, is_admin, drive):
    comms = []
    entryPolyDict = dict()
    streets = {}
    cities = {}
    tasks = []
    async with aioboto3.client(
            "s3",
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),) as client:
        for obj in query:
            tasks.append(insideloop(obj, client, is_admin, drive))

        results = await asyncio.gather(*tasks)
        # print(results)
        for item in results:
            # print(item)
            comms.append(item[0])
            entryPolyDict[item[0].entry_ID] = item[1]
            if item[2] and item[3]:
                streets[item[0].entry_ID] = item[2]
                cities[item[0].entry_ID] = item[3]

    # print(type(results))
    # print(type(results[0]))
    # print(results[0])
    return entryPolyDict, comms, streets, cities

async def insideloop(obj, client, is_admin, drive):
    try:
        comm, coords = await getfroms3(
            client, obj, drive, obj.state, is_admin
        )
    except Exception:
        if not obj.census_blocks_polygon and obj.user_polygon:
            s = "".join(obj.user_polygon.geojson)
        elif obj.census_blocks_polygon:
            s = "".join(obj.census_blocks_polygon.geojson)
        else:
            return None
        if is_admin:
            if not obj.user_name:
                obj.user_name = obj.user.username
        else:
            if obj.user_name:
                obj.user_name = ""

        # comms.append(obj)
        struct = geojson.loads(s)
        coords = struct.coordinates
        # entryPolyDict[obj.entry_ID] = struct.coordinates

    print("requests finished at time %s" % time.time())
    street = None
    city = None
    if is_admin:
        for a in Address.objects.filter(entry=obj):
            # streets[obj.entry_ID] = a.street
            # cities[obj.entry_ID] = (
            #     a.city + ", " + a.state + " " + a.zipcode
            # )
            street = a.street
            city = a.city + ", " + a.state + " " + a.zipcode
    return obj, coords, street, city


async def getfroms3(client, obj, drive, state, is_admin):
    print("request made at time %s" % time.time())
    if drive:
        folder_name = drive.slug
    elif not drive and obj.drive:
        folder_name = obj.drive.slug
    else:
        folder_name = state
    response = await client.get_object(
        Bucket=os.environ.get("AWS_STORAGE_BUCKET_NAME"),
        Key=str(folder_name) + "/" + obj.entry_ID + ".geojson",
    )
    # print(response)
    strobj = await response["Body"].read()
    strobject = strobj.decode("utf-8")
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
    if is_admin:
        if obj.user_name:
            comm.user_name = obj.user_name
        else:
            obj.user.username
    # comms.append(comm)
    # entryPolyDict[obj.entry_ID] = mapentry["geometry"]["coordinates"]
    return comm, mapentry["geometry"]["coordinates"]


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

        client = boto3.client(
            "s3",
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        )
        all_gj = []
        for entry in query:
            if not entry.organization:
                continue
            gj = make_geojson(request, entry)
        all_gj.append(gj)

        final = geojson.FeatureCollection(all_gj)

        if(kwargs['type'] == 'geo'):
            print('********', 'geo', '********')
            response = HttpResponse(geojson.dumps(final), content_type="application/json")
        else:
            print('********', 'csv', '********')
            dictform = json.loads(geojson.dumps(final))
            df = pandas.DataFrame()
            for entry in dictform['features']:
                row_dict = entry['properties'].copy()
                row_dict['geometry'] = str(entry['geometry'])
                df = df.append(row_dict, ignore_index=True)
            response = HttpResponse(df.to_csv(), content_type="text/csv")

        return response


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

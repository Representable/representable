from ..models import (
    Membership,
    Organization,
    WhiteListEntry,
    Tag,
    CommunityEntry,
    Campaign,
    Address
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
        if self.kwargs["campaign"]:
            query = CommunityEntry.objects.filter(
                organization__slug=self.kwargs["slug"],
                campaign__slug=self.kwargs["campaign"],
                admin_approved=True,
            )
        else:
            query = CommunityEntry.objects.filter(
                organization__slug=self.kwargs["slug"], admin_approved=True
            )
        for obj in query:
            for a in Address.objects.filter(entry=obj):
                streets[obj.entry_ID] = a.street
                cities[obj.entry_ID] = a.city + ", " + a.state + " " + a.zipcode
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
        context["organization"] = Organization.objects.get(
            slug=self.kwargs["slug"]
        )
        if self.kwargs["campaign"]:
            context["campaign"] = get_object_or_404(
                Campaign, slug=self.kwargs["campaign"]
            ).name
        if (self.request.user.is_authenticated):
            context["is_org_admin"] = self.request.user.is_org_admin(
                Organization.objects.get(slug=self.kwargs["slug"]).id
            )
            context["is_org_moderator"] = self.request.user.is_org_moderator(
                Organization.objects.get(slug=self.kwargs["slug"]).id
            )
        return context

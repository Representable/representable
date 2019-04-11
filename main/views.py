from django.shortcuts import render
from django.views.generic import TemplateView, ListView
from .models import Entry
from .forms import CommunityForm
from django.views.generic.edit import FormView
from django.core.serializers import serialize
from shapely.geometry import Polygon, mapping
import geojson
import os
from django.http import JsonResponse
import json
from shapely.geometry import shape
from allauth.account.decorators import verified_email_required
from django.shortcuts import redirect

# must be imported after other models
from django.contrib.gis.geos import Point

# https://docs.djangoproject.com/en/2.1/topics/class-based-views/

#******************************************************************************#

class Index(TemplateView):
    template_name = "main/index.html"

#******************************************************************************#

class Timeline(TemplateView):
    template_name = "main/timeline.html"

#******************************************************************************#

class Map(TemplateView):
    template_name = "main/map.html"
    # serialize('geojson', Entry.objects.all(), geometry_field='polygon', fields=('entry_polygon',))

    def get_context_data(self, **kwargs):
        # GEOJSONSerializer = serializers.get_serializer("geojson")
        # geojson_serializer = GEOJSONSerializer()
        # geojson_serializer.serialize(Entry.objects.only('entry_polygon'))
        # data = geojson_serializer.getvalue()
        data = serialize("geojson", Entry.objects.all(
        ), geometry_field="Polygon", fields=("entry_polygon", "Polygon",))
        print("printing data")
        # print(data)
        # struct = json.loads(data)
        # data = Entry.objects.only('entry_polygon')

        # s = "".join(data)
        # something = geojson.loads(s)

        # print(geojson.loads(Entry.objects.all()))
        # print(data[0])
        # print(geojson.Polygon(data[0]))
        # data = json.dumps(struct)
        a = []
        for obj in Entry.objects.all():
            # print(obj.entry_polygon.geojson)
            a.append(obj.entry_polygon.geojson)

        final = []
        for obj in a:
            s = "".join(obj)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            print("printing the struct")
            print(struct)
            final.append(struct.coordinates)

        context = ({
            # 'entries':  serialize('geojson', Entry.objects.all(), geometry_field='polygon', fields=('entry_polygon')),
            # 'entries': data,
            'entries': final,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY'),
        })
        return context

#******************************************************************************#

class Thanks(TemplateView):
    template_name = "main/thanks.html"

# https://docs.djangoproject.com/en/2.1/topics/class-based-views/generic-editing/

#******************************************************************************#

class CommunityView(FormView):
    template_name = 'main/community_form.html'
    form_class = CommunityForm
    success_url = '/thanks/'

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)

# Geo View - Generic Template (See Django tutorial)
# https://stackoverflow.com/questions/41697984/django-redirect-already-logged-user-by-class-based-view

#******************************************************************************#

class GeoView(TemplateView):
    template_name = 'main/geo.html'

    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('/accounts/login')
        return super(GeoView, self).get(request, *args, **kwargs)

#******************************************************************************#

# EntryView displays the form and map selection screen.

class EntryView(FormView):
    template_name = 'main/entry.html'
    form_class = CommunityForm
    success_url = '/thanks/'
    # Add extra context variables.
    def get_context_data(self, **kwargs):
        context = super(EntryView, self).get_context_data(**kwargs) # get the default context data
        context['mapbox_key'] = os.environ.get('DISTR_MAPBOX_KEY')
        return context
    # Redirect to login if user not authenticated
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('/accounts/login')
        return super(EntryView, self).get(request, *args, **kwargs)
    # Validate form
    def form_valid(self, form):
        form.save()
        return super().form_valid(form)

#******************************************************************************#

# savePolygon saves the Polygon to the DB for the current entry. Inspired from:
# https://l.messenger.com/l.php?u=https%3A%2F%2Fsimpleisbetterthancomplex.com%2Ftutorial%2F2016%2F08%2F29%2Fhow-to-work-with-ajax-request-with-django.html&h=AT2eBJBqRwotQY98nmtDeTb6y0BYi-ydl5NuMK68-V1LIRsZY11LiFF6o6HUCLsrn0vfPqJYoJ0RsZNQGvLO9qBJPphpzlX4fkxhtRrIzAgOsHmcC6pDV2MzhaeUT-hhj4M2-iOUyg
def savePolygon(request):
    # Get Request and Deserialize it with json.loads()
    request_entry_poly = request.GET.get('entry_features', None)
    request_map_center = request.GET.get('map_center', None)
    entryGeoJson = json.loads(request_entry_poly)
    mapCenterJson = json.loads(request_map_center)
    # print(entryGeoJson['id'])
    # print(entryGeoJson['geometry'])
    # print(mapCenterJson)
    # Convert GeoJson to WKT
    # https://gist.github.com/drmalex07/5a54fc4f1db06a66679e
    geom_poly = shape(entryGeoJson['geometry']).wkt
    geom_point = Point(mapCenterJson[0], mapCenterJson[1])

    # GET USER OBJECT
    current_user_id = request.user
    # Save to DB
    new_entry = Entry(
        creator_ID=current_user_id,
        entry_ID=entryGeoJson['id'],
        entry_polygon=geom_poly,
        entry_location=geom_point)
    new_entry.save()
    data = {
        'worked': True
    }
    if data['worked']:
        data['error_message'] = 'Error.'
    return JsonResponse(data)

#******************************************************************************#

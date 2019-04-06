from django.shortcuts import render
from django.views.generic import TemplateView
from .models import CommunityForm, Entry
from django.views.generic.edit import FormView

# Geo Page (from fmr stricter)
from django.http import JsonResponse
import json
from shapely.geometry import shape
from django.contrib.gis.geos import Point

# https://docs.djangoproject.com/en/2.1/topics/class-based-views/
class Index(TemplateView):
    template_name = "main/index.html"

class Timeline(TemplateView):
    template_name = "main/timeline.html"

class Map(TemplateView):
    template_name = "main/map.html"

class Thanks(TemplateView):
    template_name = "main/thanks.html"

# https://docs.djangoproject.com/en/2.1/topics/class-based-views/generic-editing/
class CommunityView(FormView):
    template_name = 'main/community_form.html'
    form_class = CommunityForm
    success_url = '/thanks/'

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)


# Geo View - Generic Template (See Django tutorial)
class GeoView(TemplateView):
    template_name = 'main/index_geo.html'

# savePolygon saves the Polygon to the DB for the current entry. Inspired from:
# https://l.messenger.com/l.php?u=https%3A%2F%2Fsimpleisbetterthancomplex.com%2Ftutorial%2F2016%2F08%2F29%2Fhow-to-work-with-ajax-request-with-django.html&h=AT2eBJBqRwotQY98nmtDeTb6y0BYi-ydl5NuMK68-V1LIRsZY11LiFF6o6HUCLsrn0vfPqJYoJ0RsZNQGvLO9qBJPphpzlX4fkxhtRrIzAgOsHmcC6pDV2MzhaeUT-hhj4M2-iOUyg
def savePolygon(request):
    print("Got request!")
    # Get Request and Deserialize it with json.loads()
    request_entry_poly = request.GET.get('entry_features', None)
    request_map_center = request.GET.get('map_center', None)
    entryGeoJson = json.loads(request_entry_poly)
    mapCenterJson = json.loads(request_map_center)
    print(entryGeoJson['id'])
    print(entryGeoJson['geometry'])
    print(mapCenterJson)
    # Convert GeoJson to WKT
    # https://gist.github.com/drmalex07/5a54fc4f1db06a66679e
    geom_poly = shape(entryGeoJson['geometry']).wkt
    geom_point = Point(mapCenterJson[0], mapCenterJson[1])
    # Save to DB
    new_entry = Entry(entry_ID=entryGeoJson['id'], entry_polygon=geom_poly, entry_location=geom_point)
    new_entry.save()
    data = {
        'worked': True
    }
    if data['worked']:
        data['error_message'] = 'Error.'
    return JsonResponse(data)

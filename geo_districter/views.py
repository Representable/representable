from django.shortcuts import render
from django.views import generic
from django.http import JsonResponse
import json


from django.http import HttpResponse

# Index View - Generic Template (See Django tutorial)
class IndexView(generic.TemplateView):
    template_name = 'geo_districter/index.html'

# savePolygon saves the Polygon to the DB for the current entry. Inspired from:
# https://l.messenger.com/l.php?u=https%3A%2F%2Fsimpleisbetterthancomplex.com%2Ftutorial%2F2016%2F08%2F29%2Fhow-to-work-with-ajax-request-with-django.html&h=AT2eBJBqRwotQY98nmtDeTb6y0BYi-ydl5NuMK68-V1LIRsZY11LiFF6o6HUCLsrn0vfPqJYoJ0RsZNQGvLO9qBJPphpzlX4fkxhtRrIzAgOsHmcC6pDV2MzhaeUT-hhj4M2-iOUyg
def savePolygon(request):
    print("Got request!")
    # Get Request and Deserialize it with json.loads()
    request_entry_poly = request.GET.get('entry_features')
    entryGeoJson = json.loads(request_entry_poly)
    print(entryGeoJson['id'])
    print(entryGeoJson['geometry'])
    # Save to DB
    # new_entry = Entry(entry_ID=entryGeoJson['id'], entry_poly=)
    data = {
        'worked': True
    }
    if data['worked']:
        data['error_message'] = 'Error.'
    return JsonResponse(data)

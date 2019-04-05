from django.shortcuts import render
from django.views import generic
from django.http import JsonResponse


from django.http import HttpResponse

# Index View - Generic Template (See Django tutorial)
class IndexView(generic.TemplateView):
    template_name = 'geo_districter/index.html'

# savePolygon saves the Polygon to the DB for the current entry.
def savePolygon(request):
    print("Got request!")
    dummy_data = request.GET.get('dummy_data', None)
    data = {
        'worked': True
    }
    return JsonResponse(data)
    # entry_loc = request.GET.get('location', None)
    # entry_poly = request.GET.get('polygon', None)
    # data = {
    #     'is_taken': User.objects.filter(username__iexact=username).exists()
    # }
    # return JsonResponse(data)

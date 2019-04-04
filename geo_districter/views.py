from django.shortcuts import render
from django.views import generic

from django.http import HttpResponse

# Index View - Generic Template (See Django tutorial)
class IndexView(generic.TemplateView):
    template_name = 'geo_districter/index.html'

# savePolygon saves the Polygon to the DB for the current entry.
def savePolygon(request):
    # TODO: Implement Function.
    return 0

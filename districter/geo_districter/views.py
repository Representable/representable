from django.shortcuts import render
from django.views import generic

# Create your views here.
from django.http import HttpResponse

class IndexView(generic.TemplateView):
    template_name = 'geo_districter/index.html'

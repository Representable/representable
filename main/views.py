from django.shortcuts import render
from django.views.generic import TemplateView

# https://docs.djangoproject.com/en/2.1/topics/class-based-views/
class Index(TemplateView):
    template_name = "main/index.html"

class Timeline(TemplateView):
    template_name = "main/timeline.html"

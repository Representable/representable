from django.shortcuts import render
from django.views.generic import TemplateView
from .models import CommunityForm
from django.views.generic.edit import FormView

# https://docs.djangoproject.com/en/2.1/topics/class-based-views/
class Index(TemplateView):
    template_name = "main/index.html"

class Timeline(TemplateView):
    template_name = "main/timeline.html"

<<<<<<< HEAD
class Map(TemplateView):
    template_name = "main/map.html"
=======
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
>>>>>>> main_lej2

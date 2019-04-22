from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.views.generic import TemplateView, ListView
from django.views import View
# from .models import Entry
from .forms import CommunityForm, IssueForm
from .models import CommunityEntry
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
from django.contrib.auth.mixins import LoginRequiredMixin


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
        # data = serialize("geojson", CommunityEntry.objects.all(
        # ), geometry_field="Polygon", fields=("entry_polygon", "Polygon",))
        # print("printing data")
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
        for obj in CommunityEntry.objects.all():
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
    form_class = IssueForm
    success_url = '/thanks/'


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

# class EntryView(LoginRequiredMixin, FormView):
#     template_name = 'main/entry.html'
#     form_class = CommunityForm
#     success_url = '/thanks/'
#     # Add extra context variables.
#     def get_context_data(self, **kwargs):
#         context = super(EntryView, self).get_context_data(**kwargs) # get the default context data
#         context['mapbox_key'] = os.environ.get('DISTR_MAPBOX_KEY')
#         return context
#     # Redirect to login if user not authenticated
#     def get(self, request, *args, **kwargs):
#         if not request.user.is_authenticated:
#             return redirect('/accounts/login')
#         return super(EntryView, self).get(request, *args, **kwargs)
#     # Validate form
#     def form_valid(self, form):
#         # https://stackoverflow.com/questions/569468/django-multiple-models-in-one-template-using-forms/575133#575133
#         # Use commit false to change a field
#         # -*- coding: utf-8 -*-
#         eprint("ELON MUSK")
#         for each_tag in form.fields.tags:
#             tag, created = Tag.objects.get_or_create(name=each_tag)
#             print('The tag in the parsed podcast is {}'.format(each_tag))
#             form.tags.add(tag)
#         form.save()
#         #form.save_m2m()
#         return super().form_valid(form)
#     # https://www.agiliq.com/blog/2019/01/django-formview/
#     def get_initial(self):
#         initial = super(EntryView, self).get_initial()
#         if self.request.user.is_authenticated:
#             initial.update({'user': self.request.user})
#         print(self.request.user);
#         return initial


class EntryView(View, LoginRequiredMixin):
    template_name = 'main/entry.html'
    form_class = CommunityForm
    initial = {'key': 'value'}
    success_url = '/thanks/'

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        print("get_initial")
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({'user': self.request.user})
            initial.update({'zipcode': '00000'})
        print(self.request.user);
        return initial

    def get(self, request, *args, **kwargs):
        print("GET")
        form = self.form_class(initial=self.get_initial())
        return render(request, self.template_name, {'form': form, 'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY')})

    def post(self, request, *args, **kwargs):
        print("POST")
        form = self.form_class(request.POST)
        print(f"FORM IS VALID: {form.is_valid()")
        if form.is_valid():
            # <process form cleaned data>
            return HttpResponseRedirect(self.success_url)
        print("NOT VALID BRUH")
        return render(request, self.template_name, {'form': form, 'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY')})

#******************************************************************************#

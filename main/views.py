#
# Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
#
# This file is part of Representable
# (see http://representable.org).
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, ListView
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from allauth.account.decorators import verified_email_required
from django.forms import formset_factory
from .forms import CommunityForm, IssueForm, DeletionForm
from .models import CommunityEntry, Issue, Tag
from django.views.generic.edit import FormView
from django.core.serializers import serialize
from shapely.geometry import Polygon, mapping
import geojson, os, json, re
from django.http import JsonResponse
import shapely.wkt
import reverse_geocoder as rg
from state_abbrev import us_state_abbrev


#******************************************************************************#

# must be imported after other models
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.contrib.gis.db.models import Union
from django.contrib.gis.geos import GEOSGeometry
#******************************************************************************#
def category_clean(cat):
    ''' clean category names for clarity in visualizations '''
    cat = re.sub("_", " ", cat).title()
    if cat == "Religion":
        cat = "Religion/Church"
    if cat == "Race":
        cat = "Race/Ethnicity"
    if cat == "Immigration":
        cat = "Immigration Status"
    if cat == "Neighborhood":
        cat = "Neighborhood Identity/Official Definition"
    if cat == "Lgbt":
        cat = "LGBT Issues"
    return cat
#******************************************************************************#
'''
Documentation: https://docs.djangoproject.com/en/2.1/topics/class-based-views/
'''

class Index(TemplateView):
    template_name = "main/index.html"

    # Add extra context variables.
    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(
            **kwargs)  # get the default context data
        context['mapbox_key'] = os.environ.get('DISTR_MAPBOX_KEY')
        return context

#******************************************************************************#

class MainView(TemplateView):
    template_name = "main/main_test.html"

    # Add extra context variables.
    def get_context_data(self, **kwargs):
        context = super(MainView, self).get_context_data(
            **kwargs)  # get the default context data
        context['mapbox_key'] = os.environ.get('DISTR_MAPBOX_KEY')
        return context

#******************************************************************************#

class Timeline(TemplateView):
    template_name = "main/timeline.html"

#******************************************************************************#

class About(TemplateView):
    template_name = "main/about.html"

#******************************************************************************#
class Review(LoginRequiredMixin, TemplateView):
    template_name = "main/review.html"
    form_class = DeletionForm
    initial = {'key': 'value'}

    def centroid(self, pt_list):
        print(pt_list)
        length = len(pt_list)
        sum_x = sum([x[1] for x in pt_list]) # TODO coords are reversed for some reason?
        sum_y = sum([x[0] for x in pt_list])
        return sum_x / length, sum_y / length

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({'user': self.request.user})
        return initial

    def get_context_data(self, **kwargs):
        form = self.form_class(initial=self.get_initial(), label_suffix='')
        # the dict of issues + input of descriptions
        issues = dict()
        for obj in Issue.objects.all():
            cat = category_clean(obj.category)

            if cat in issues:
                issues[cat][str(obj.entry)] = obj.description
            else:
                issueInfo = dict()
                issueInfo[str(obj.entry)] = obj.description
                issues[cat] = issueInfo

        # the polygon coordinates
        entryPolyDict = dict()
        # dictionary of tags to be displayed
        tags = dict()
        for obj in Tag.objects.all():
            # manytomany query
            entries = obj.communityentry_set.all()
            ids = []
            for id in entries:
                ids.append(str(id))
            tags[str(obj)] = ids

        user = self.request.user
        authorDict = dict() # if superuser, who submitted this
        approvedList = list() # TODO make list?
        if user.is_staff:
            query = CommunityEntry.objects.all()
            for obj in query:
                if (obj.census_blocks_polygon == '' or obj.census_blocks_polygon == None):
                    s = "".join(obj.user_polygon.geojson)
                else:
                    s = "".join(obj.census_blocks_polygon.geojson)
                struct = geojson.loads(s)
                ct = self.centroid(struct['coordinates'][0])
                # https://github.com/thampiman/reverse-geocoder
                # note that this is an offline reverse geocoding library
                # reverse geocode to see which states this is in
                results = rg.search(ct)
                print(results)
                if len(results) == 0:
                    continue # skip this community: reverse geocoding failed!
                admins = [y for x,y in results[0].items()]
                # get the states that the object is in
                possib_states = set([us_state_abbrev[x] for x in us_state_abbrev.keys() if x in admins])
                # now make sure user is authorized to edit state
                authorized = set([g.name.upper() for g in user.groups.all()]) # TODO assume all groups are state
                if possib_states.issubset(authorized):
                    print('Authorized for states {}'.format(possib_states))
                    # add it to viewable
                    entryPolyDict[obj.entry_ID] = struct.coordinates
                    authorDict[obj.entry_ID] = obj.user.username
                    if obj.admin_approved:
                        approvedList.append(obj.entry_ID)
        else:
            # in this case, just get the ones we made
            query = CommunityEntry.objects.filter(user = self.request.user)
            for obj in query:
                if (obj.census_blocks_polygon == '' or obj.census_blocks_polygon == None):
                    s = "".join(obj.user_polygon.geojson)
                else:
                    s = "".join(obj.census_blocks_polygon.geojson)
                # add all the coordinates in the array
                # at this point all the elements of the array are coordinates of the polygons
                struct = geojson.loads(s)
                entryPolyDict[obj.entry_ID] = struct.coordinates
                if obj.admin_approved:
                    approvedList.append(obj.entry_ID)

        context = ({
            'form': form,
            'tags': json.dumps(tags),
            'issues': json.dumps(issues),
            'entries': json.dumps(entryPolyDict),
            'authors': json.dumps(authorDict),
            'approved': json.dumps(approvedList),
            'communities': query,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY'),
        })
        return context
    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, label_suffix='')
        # delete entry if form is valid and entry belongs to current user
        if form.is_valid() and self.request.user.is_staff:
            query = CommunityEntry.objects.filter(user = self.request.user)
            entry = query.get(entry_ID=request.POST.get('c_id'))
            # TODO check whether authorized to edit state?
            if 'Approve' in request.POST: # TODO need someone to review security
                entry.admin_approved = True
                entry.save()
            elif 'Unapprove' in request.POST:
                entry.admin_approved = False
                entry.save()
            elif 'Delete' in request.POST:
                entry.delete()
        elif form.is_valid(): # not staff, just can delete own entries
            query = CommunityEntry.objects.filter(user = self.request.user)
            entry = query.get(entry_ID=request.POST.get('c_id'))
            entry.delete()

        issues = dict()
        for obj in Issue.objects.all():
            cat = category_clean(obj.category)

            if cat in issues:
                issues[cat][str(obj.entry)] = obj.description
            else:
                issueInfo = dict()
                issueInfo[str(obj.entry)] = obj.description
                issues[cat] = issueInfo

        context = self.get_context_data() # TODO: Is there a problem with this?
        return render(request, self.template_name, context)

#******************************************************************************#

class Map(TemplateView):
    template_name = "main/map.html"
    # def write_geojson(self, features):
    #     features = [];
    #     #assume that selectedEntries contains feature objects as gathered from map.js
    #     for obj in selectedEntries.objects.all():
    #         features.append(obj)
    #     all_selected = FeatureCollection(features)
    #     with open('myfile.geojson', 'w') as f:
    #         dump(all_selected, f)
    def get_context_data(self, **kwargs):
        # the dict of issues + input of descriptions
        issues = dict()
        for obj in Issue.objects.all():
            cat = category_clean(obj.category)

            if cat in issues:
                issues[cat][str(obj.entry)] = obj.description
            else:
                issueInfo = dict()
                issueInfo[str(obj.entry)] = obj.description
                issues[cat] = issueInfo

        # the polygon coordinates
        entryPolyDict = dict()
        # dictionary of tags to be displayed
        tags = dict()
        for obj in Tag.objects.all():
            # manytomany query
            entries = obj.communityentry_set.all()
            ids = []
            for id in entries:
                ids.append(str(id))
            tags[str(obj)] = ids
        # get the polygon from db and pass it on to html
        for obj in CommunityEntry.objects.all():
            if not obj.admin_approved: continue
            if (obj.census_blocks_polygon == '' or obj.census_blocks_polygon == None):
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_polygon.geojson)

            # add all the coordinates in the array
            # at this point all the elements of the array are coordinates of the polygons
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates

        context = ({
            'tags': json.dumps(tags),
            'issues': json.dumps(issues),
            'entries': json.dumps(entryPolyDict),
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY'),
        })
        return context

#******************************************************************************#


class Thanks(TemplateView):
    template_name = "main/thanks.html"

#******************************************************************************#


class EntryView(LoginRequiredMixin, View):
    '''
    EntryView displays the form and map selection screen.
    '''
    template_name = 'main/entry.html'
    form_class = CommunityForm
    initial = {'key': 'value'}
    success_url = '/thanks/'
    data = {
        'form-TOTAL_FORMS': '1',
        'form-INITIAL_FORMS': '0',
        'form-MAX_NUM_FORMS': '10'
    }
    # Create the formset, specifying the form and formset we want to use.
    IssueFormSet = formset_factory(IssueForm, extra=1)

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({'user': self.request.user})
        return initial

    def get(self, request, *args, **kwargs):
        form = self.form_class(initial=self.get_initial(), label_suffix='')
        issue_formset = self.IssueFormSet(self.data)
        context = {
            'form': form,
            'issue_formset': issue_formset,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY')
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, label_suffix='')
        issue_formset = self.IssueFormSet(request.POST)
        if form.is_valid() and issue_formset.is_valid():
            tag_name_qs = form.cleaned_data['tags'].values('name')
            entryForm = form.save(commit=False)
            # get all the polygons from the array
            # This returns an array of Django GEOS Polygon types
            polyArray = form.data['census_blocks_polygon_array']

            if (polyArray != None and polyArray != ''):
                polyArray = polyArray.split('|')
                newPolyArr = []
                # union them one at a time- does not work

                for stringPolygon in polyArray:
                    new_poly = GEOSGeometry(stringPolygon, srid=4326)
                    newPolyArr.append(new_poly)

                mpoly = MultiPolygon(newPolyArr)
                polygonUnion = mpoly.unary_union
                polygonUnion.normalize()
                # if one polygon is returned, create a multipolygon
                if (polygonUnion.geom_typeid == 3):
                    polygonUnion = MultiPolygon(polygonUnion)

                entryForm.census_blocks_polygon = polygonUnion

            entryForm.save()
            for tag_name in tag_name_qs:
                tag = Tag.objects.get(name=str(tag_name['name']))
                entryForm.tags.add(tag)

            for issue_form in issue_formset:
                category = issue_form.cleaned_data.get('category')
                description = issue_form.cleaned_data.get('description')
                # Ignore form row if it's completely empty.
                if category and description:
                    issue = issue_form.save(commit=False)
                    # Set issueFormset form Foreign Key (entry) to the recently
                    # created entryForm.
                    issue.entry = entryForm
                    issue.save()

            return HttpResponseRedirect(self.success_url)
        context = {
            'form': form,
            'issue_formset': issue_formset,
            'mapbox_key': os.environ.get('DISTR_MAPBOX_KEY')
        }
        # print(issue_formset)
        return render(request, self.template_name, context)

#******************************************************************************#

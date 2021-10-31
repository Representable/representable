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
from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.contrib.auth.admin import UserAdmin
from django.core.serializers import serialize
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from main.models import CommunityEntry, Report
from .models import User
from django.urls import reverse
from django.utils.html import format_html
from django.http import HttpResponse

from django import forms
from ckeditor.widgets import CKEditorWidget
import pandas as pd

import csv
import geojson
from geojson_rewind import rewind

from .models import State, Drive, Organization, Address

# ********************************************************************* #

# make geojson for state map pages
def make_geojson_for_state_map_page(request, entry):
    map_geojson = serialize(
        "geojson",
        [entry],
        geometry_field="census_blocks_polygon",
        fields=(
            "entry_name",
            "cultural_interests",
            "economic_interests",
            "comm_activities",
            "other_considerations",
            "custom_response",
            "population",
        ),
    )
    gj = geojson.loads(map_geojson)
    gj = rewind(gj)
    del gj["crs"]
    user_map = entry
    # iterate over block_groups or census_blocks in order to get array of IDs
    if user_map.block_groups.exists():
        gj["features"][0]["properties"]["block_group_ids"] = [
            bg.census_id for bg in user_map.block_groups.all()
        ]
    elif user_map.census_blocks.exists():
        gj["features"][0]["properties"]["census_block_ids"] = [
            block.census_id for block in user_map.census_blocks.all()
        ]
    # include organization and drive submitted to, if so
    if user_map.organization:
        gj["features"][0]["properties"][
            "organization"
        ] = user_map.organization.name
    if user_map.drive:
        gj["features"][0]["properties"]["drive"] = user_map.drive.name

    gj["features"][0]["properties"]["author_name"] = user_map.user_name
    for a in Address.objects.filter(entry=user_map):
        addy = (
            a.street + " " + a.city + ", " + a.state + " " + a.zipcode
        )
        gj["features"][0]["properties"]["address"] = addy

    feature = gj["features"][0]
    return feature

# ********************************************************************* #

class ExportCsvMixin:
    def export_as_csv(self, request, queryset):

        meta = self.model._meta
        field_names = [field.name for field in meta.fields]

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            row = writer.writerow([getattr(obj, field) for field in field_names])

        return response

    export_as_csv.short_description = "Export Selected"

# ********************************************************************* #

class StateAdminForm(forms.ModelForm):
    content_news = forms.CharField(widget=CKEditorWidget())
    content_criteria = forms.CharField(widget=CKEditorWidget())
    content_coi = forms.CharField(widget=CKEditorWidget())

    class Meta:
        model = State
        fields = (
            "id",
            "name",
            "abbr",
            "content_news",
            "content_criteria",
            "content_coi",
        )

class StateAdmin(admin.ModelAdmin):
    form = StateAdminForm
    list_display = ("name", "abbr", "get_drives")


admin.site.register(State, StateAdmin)

admin.site.register(User, UserAdmin)

class ReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "email",
        "resolved",
        "is_admin_approved",
        "timestamp",
        "link_to_community",
    )
    list_filter = ("resolved",)

    list_select_related = ("community",)
    actions = ["unapprove_resolve", "approve_resolve"]

    def is_admin_approved(self, obj):
        return obj.community.admin_approved

    def unapprove_resolve(self, request, queryset):
        for rep in queryset:
            rep.unapprove()
            rep.resolved = True
            rep.save()

    def approve_resolve(self, request, queryset):
        for rep in queryset:
            rep.approve()
            rep.resolved = True
            rep.save()

    unapprove_resolve.short_description = (
        "Unapprove the community and mark as resolved"
    )

    approve_resolve.short_description = (
        "Approve the community and mark as resolved"
    )

    def link_to_community(self, obj):
        link = reverse(
            "admin:main_communityentry_change", args=[obj.community.id]
        )  # model name has to be lowercase
        return format_html(
            '<a href="{}">{}</a>', link, obj.community.entry_name
        )

    link_to_community.allow_tags = True

    # def change_view(self, request, object_id, form_url='', extra_context=None):
    #     extra_context = extra_context or {}
    #     report = Report.objects.get(id=object_id)
    #     extra_context['admin_approved'] = self.get_admin_approved(report)
    #     return super().change_view(
    #         request, object_id, form_url, extra_context=extra_context,
    #     )

    class Meta:
        model = Report
        fields = (
            "email",
            "community",
            "resolved",
            "timestamp",
        )


admin.site.register(Report, ReportAdmin)


class CommunityResource(resources.ModelResource):
    class Meta:
        model = CommunityEntry
        fields = (
            "id",
            "user_name",
            "user__email",
            "entry_name",
            "cultural_interests",
            "economic_interests",
            "comm_activities",
            "user_polygon",
            "census_blocks_polygon",
            "created_at",
        )
        export_order = (
            "id",
            "user_name",
            "user__email",
            "entry_name",
            "cultural_interests",
            "economic_interests",
            "comm_activities",
            "created_at",
            "user_polygon",
            "census_blocks_polygon",
        )


class CommunityAdmin(ImportExportModelAdmin):
    date_hierarchy = "created_at"
    list_display = (
        "id",
        "user_name",
        "get_user_email",
        "entry_name",
        "organization",
        "drive",
        "state",
        "admin_approved",
        'get_services_length',
        'get_economic_length',
        'get_cultural_length',
        'get_needs_length',
        'get_tags',
    )
    list_filter = (
        "drive",
        "organization",
        "state",
        "tags"
    )

    def export_emails_as_csv(self, request, queryset):

        meta = queryset.model._meta

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)

        for obj in queryset:
            row = writer.writerow([obj.user.email])

        return response

    def export_cois_block_equiv(self, request, queryset):

        df = pd.DataFrame()
        i = 0
        for obj in queryset:
            i += 1
            # iterate over block_groups or census_blocks in order to get array of IDs
            row_data = dict()
            if obj.block_groups.exists():
                row_data['BLOCKID'] = [bg.census_id for bg in obj.block_groups.all()]
            elif obj.census_blocks.exists():
                row_data['BLOCKID'] = [block.census_id for block in obj.census_blocks.all()]
            else:
                break
            row_data['DISTRICT'] = [i] * len(row_data['BLOCKID'])
            df = df.append(pd.DataFrame(row_data))

        return HttpResponse(df.to_csv(index=False), content_type="text/csv")

    def export_cois_geojson(self, request, queryset):

        all_gj = []
        for entry in queryset:
            gj = make_geojson_for_state_map_page(request, entry)
            all_gj.append(gj)

        final = geojson.FeatureCollection(all_gj)

        return HttpResponse(geojson.dumps(final), headers={
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="communities.geojson"'})

    def export_cois_testimony(self, request, queryset):

        meta = queryset.model._meta

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)
        writer.writerow(["ENTRY NAME", "DISTRICT", "AUTHOR NAME", "ADDRESS", "CULTURAL AND HISTORICAL INTERESTS",
        "ECONOMIC OR ENVIRONMENTAL INTERESTS", "COMMUNITY ACTIVITIES AND SERVICES", "COMMUNITY NEEDS AND CONCERNS",
        "RESPONSE TO CUSTOM DRIVE QUESTION", "POPULATION"])

        i = 0
        for obj in queryset:
            i += 1
            name = obj.user_name
            for a in Address.objects.filter(entry=obj):
                addy = (
                    a.street + " " + a.city + ", " + a.state + " " + a.zipcode
                )
            row = writer.writerow([obj.entry_name, i, name, addy, obj.cultural_interests, obj.economic_interests, obj.comm_activities, obj.other_considerations, obj.custom_response, obj.population])

        return response

    export_emails_as_csv.short_description = "Export Selected Emails"
    export_cois_block_equiv.short_description = "Export as block equivalency"
    export_cois_geojson.short_description = "Export as geojson"
    export_cois_testimony.short_description = "Export csv of testimony"
    actions = ["export_emails_as_csv", "export_cois_block_equiv", "export_cois_geojson", "export_cois_testimony"]

    def get_user_email(self, obj):
        return obj.user.email
    get_user_email.short_description = 'user email'
    def get_services_length(self, obj):
        return len(obj.comm_activities)
    get_services_length.short_description = 'services length'
    get_services_length.admin_order_field = 'length_services'
    def get_economic_length(self, obj):
        return len(obj.economic_interests)
    get_economic_length.short_description = 'economic length'
    get_economic_length.admin_order_field = 'length_economic'
    def get_cultural_length(self, obj):
        return len(obj.cultural_interests)
    get_cultural_length.short_description = 'cultural length'
    get_cultural_length.admin_order_field = 'length_cultural'
    def get_needs_length(self, obj):
        return len(obj.other_considerations)
    get_needs_length.short_description = 'needs length'
    get_needs_length.admin_order_field = 'length_needs'
    def get_tags(self, obj):
        tags = []
        for tag in obj.tags.all():
            tags.append(str(tag))
        return ', '.join(tags)
    get_tags.short_description = 'tags'


    resource_class = CommunityResource


admin.site.register(CommunityEntry, CommunityAdmin)

class OrgStateFilter(SimpleListFilter):
    title = 'state'
    parameter_name = 'states'

    def lookups(self, request, model_admin):
        # gets list of each state that exists with an org, for selection on admin sidebar
        states_list = [o.states for o in model_admin.model.objects.all()]
        each_state = [state for states in states_list for state in states]
        res = []
        [res.append(x) for x in each_state if x not in res]
        return [(state, state) for state in res]

    def queryset(self, request, queryset):
        # queries orgs by state in list of states
        for state in State.objects.all():
            if self.value() == state.abbr:
                return queryset.filter(states__icontains=state.abbr)

class OrganizationAdmin(admin.ModelAdmin, ExportCsvMixin):
    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "description",
            "slug",
            "states",
        )
    list_display = ("id", "name", "description", "slug", "states")
    list_filter = (OrgStateFilter,)
    actions = ["export_as_csv"]

admin.site.register(Organization, OrganizationAdmin)

class DriveStateFilter(SimpleListFilter):
    title = 'state'
    parameter_name = 'state'

    def lookups(self, request, model_admin):
        # gets list of each state that exists with an org, for selection on admin sidebar
        states_list = [o.state for o in model_admin.model.objects.all()]
        res = []
        [res.append(x) for x in states_list if x not in res]
        return [(state, state) for state in res]

    def queryset(self, request, queryset):
        # queries orgs by state in list of states
        for state in State.objects.all():
            if self.value() == state.abbr:
                return queryset.filter(state=state.abbr)

class DriveAdmin(admin.ModelAdmin, ExportCsvMixin):
    class Meta:
        model = Drive
        fields = (
            "name",
            "description",
            "organization",
            "state",
            "private",
            "draw_layer",
        )
    list_display = ("name", "description", "organization", "state", "private", "draw_layer")
    list_filter = (DriveStateFilter,)
    actions = ["export_as_csv"]

admin.site.register(Drive, DriveAdmin)

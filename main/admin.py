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
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from main.models import CommunityEntry, Report
from .models import User
from django.urls import reverse
from django.utils.html import format_html
from django.http import HttpResponse

from django import forms
from ckeditor.widgets import CKEditorWidget

import csv

from .models import State, Drive, Organization

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
        "entry_name",
        "organization",
        "drive",
        "state",
        "admin_approved",
        'get_services_length',
        'get_economic_length',
        'get_cultural_length',
        'get_needs_length',
    )
    list_filter = (
        "drive",
        "organization",
        "state",
    )

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
        )
    list_display = ("name", "description", "organization", "state", "private")
    list_filter = (DriveStateFilter,)
    actions = ["export_as_csv"]

admin.site.register(Drive, DriveAdmin)

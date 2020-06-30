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
from django.contrib.auth.admin import UserAdmin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from main.models import CommunityEntry
from .models import User

from django import forms
from ckeditor.widgets import CKEditorWidget

from .models import State, Campaign


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
    list_display = ("name", "abbr", "get_campaigns")


admin.site.register(State, StateAdmin)

admin.site.register(User, UserAdmin)


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
    list_display = (
        "id",
        "user_name",
        "entry_name",
        "organization",
        "campaign",
    )
    list_filter = (
        "campaign",
        "organization",
    )
    resource_class = CommunityResource


admin.site.register(CommunityEntry, CommunityAdmin)

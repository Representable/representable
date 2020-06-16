from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from main.models import CommunityEntry
from .models import User
from wagtail.contrib.modeladmin.options import ModelAdmin, modeladmin_register

modeladmin_register(User, UserAdmin)


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


modeladmin_register(CommunityEntry, CommunityAdmin)

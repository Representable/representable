from rest_framework import serializers
from main.models import Organization, CommunityEntry


class OrganizationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Organization
        fields = ("id", "name", "description", "ext_link", "states")


class CommunitySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = CommunityEntry
        fields = (
            "id",
            "entry_ID",
            "entry_name",
            "user_polygon",
            "census_blocks_polygon",
            "cultural_interests",
            "economic_interests",
            "comm_activities",
            "created_at",
        )

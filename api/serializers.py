from rest_framework import serializers
from main.models import Organization


class OrganizationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Organization
        fields = ("id", "name", "description", "ext_link", "states")
        lookup_field = "slug"

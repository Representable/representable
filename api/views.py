from main.models import Organization, CommunityEntry
from .serializers import OrganizationSerializer, CommunitySerializer
from rest_framework import viewsets


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for organizations
    """

    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer


class CommunityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for organizations
    """

    queryset = CommunityEntry.objects.all()
    serializer_class = CommunitySerializer

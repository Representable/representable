from main.models import Organization
from .serializers import OrganizationSerializer
from rest_framework import viewsets


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for organizations
    """

    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

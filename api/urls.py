from django.urls import include, path
from rest_framework import routers
from .views import OrganizationViewSet

router = routers.DefaultRouter()
router.register(r"organizations", OrganizationViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path("beta/api/", include(router.urls)),
    path(
        "api-auth/", include("rest_framework.urls", namespace="rest_framework")
    ),
]

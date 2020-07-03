from ..models import Drive
from django.urls import reverse, reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

# from django.views.generic.detail import SingleObjectMixin
from django.views.generic import (
    ListView,
    DetailView,
)


class IndexView(ListView):
    model = Drive
    template_name = "main/drives/index.html"
    pk_url_kwarg = "cam_pk"


class DriveView(DetailView):
    model = Drive
    template_name = "main/drives/page.html"
    pk_url_kwarg = "cam_pk"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Get Drive Slug and Organization Name
        drive_slug = self.kwargs["slug"]
        drive = Drive.objects.get(slug=drive_slug)
        drive_id = drive.id
        drive_name = drive.name
        organization = drive.organization
        organization_id = organization.id
        organization_name = organization.name
        context["drive_id"] = drive_id
        context["drive_name"] = drive_name
        context["organization_id"] = organization_id
        context["organization_name"] = organization_name
        return context

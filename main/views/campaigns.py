from ..models import Campaign
from django.urls import reverse, reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

# from django.views.generic.detail import SingleObjectMixin
from django.views.generic import (
    ListView,
    DetailView,
)


class IndexView(ListView):
    model = Campaign
    template_name = "main/campaigns/index.html"
    pk_url_kwarg = "cam_pk"


class CampaignView(DetailView):
    model = Campaign
    template_name = "main/campaigns/page.html"
    pk_url_kwarg = "cam_pk"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Get Campaign Slug and Organization Name
        campaign_slug = self.kwargs["slug"]
        campaign = Campaign.objects.get(slug=campaign_slug)
        campaign_id = campaign.id
        campaign_name = campaign.name
        organization = campaign.organization
        organization_id = organization.id
        organization_name = organization.name
        context["campaign_id"] = campaign_id
        context["campaign_name"] = campaign_name
        context["organization_id"] = organization_id
        context["organization_name"] = organization_name
        return context

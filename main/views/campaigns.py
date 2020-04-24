from ..models import Campaign
from django.urls import reverse, reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

# from django.views.generic.detail import SingleObjectMixin
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DetailView,
)
from ..forms import CampaignForm


class IndexView(ListView):
    model = Campaign
    template_name = "main/campaigns/index.html"


class CampaignView(DetailView):
    model = Campaign
    template_name = "main/campaigns/page.html"
    pk_url_kwarg = "cam_pk"

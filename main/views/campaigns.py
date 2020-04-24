from ..models import Campaign

# from django.views.generic.detail import SingleObjectMixin
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DetailView,
)


class IndexView(ListView):
    model = Campaign
    template_name = "main/campaigns/index.html"


class CampaignView(DetailView):
    model = Campaign
    template_name = "main/campaigns/page.html"

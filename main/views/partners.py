from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DetailView,
)


class IndexView(TemplateView):
    template_name = "main/partners/index.html"


class PartnerView(TemplateView):
    template_name = "main/partners/index.html"

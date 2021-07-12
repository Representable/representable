from ..models import (
    Drive,
    State,
    # Image
)
from django.urls import reverse, reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

# from django.views.generic.detail import SingleObjectMixin
from django.views.generic import (
    ListView,
    DetailView,
)

# from django.shortcuts import render
# # from ..forms import ImageForm

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
        # Get Drive State object
        drive_slug = self.kwargs["slug"]
        drive = Drive.objects.get(slug=drive_slug)
        if (State.objects.filter(abbr=drive.state)):
            context["state"] = State.objects.filter(abbr=drive.state)[0]
            context["page_type"] = "drive-page"
        return context


# def showimage(request):
#     lastimage= Image.objects.last()
#     imagefile= lastimage.imagefile

#     form= ImageForm(request.POST or None, request.FILES or None)
#     if form.is_valid():
#         form.save()
  
#     context= {'imagefile': imagefile,
#               'form': form
#               }   
      
#     return render(request, 'Blog/images.html', context)

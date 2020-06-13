from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import os


@login_required(login_url="/accounts/login/")
def index(request):
    mapbox_key = os.environ.get("DISTR_MAPBOX_KEY")
    return render(request, "frontend/index.html", {'mapbox_key': mapbox_key})

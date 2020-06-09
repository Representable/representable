from django.urls import path
from . import views


urlpatterns = [
    path("beta/", views.index),
]

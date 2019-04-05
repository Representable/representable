from django.urls import path

from . import views
from districter.settings import MAPBOX_KEY

app_name = "geo_districter"
urlpatterns = [
    path('', views.IndexView.as_view(), {'mapbox_key': MAPBOX_KEY}, name='index'),
    path('ajax/dummy_save/', views.savePolygon, name='savePolygon'),
]

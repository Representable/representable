from django.urls import path

from . import views
from districter.settings import MAPBOX_KEY

app_name = "main"
urlpatterns = [
    path('', views.Index.as_view(), name='index'),
    path('timeline/', views.Timeline.as_view(), name='timeline'),
    path('map/', views.Map.as_view(), name='map'),
    path('thanks/', views.Thanks.as_view(), name='thanks'),
    path('form/', views.CommunityView.as_view(), name='community_form'),
    path('geo/', views.GeoView.as_view(), {'mapbox_key': MAPBOX_KEY}, name='geo'),
    path('fullgeo/', views.FullGeoView.as_view(), {'mapbox_key': MAPBOX_KEY}, name='fullgeo'),
    path('geo/ajax/dummy_save/', views.savePolygon, name='savePolygon')
]

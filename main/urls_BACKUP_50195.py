from django.urls import path

from . import views
from districter.settings import MAPBOX_KEY

app_name = "main"
urlpatterns = [
    path('', views.Index.as_view(), name='index'),
    path('timeline/', views.Timeline.as_view(), name='timeline'),
    path('map/', views.Map.as_view(), name='map'),
    path('thanks/', views.Thanks.as_view(), name='thanks'),
    path('entry/', views.EntryView.as_view(), name='entry'),
<<<<<<< HEAD
=======
    path('entry/', views.EntryView.as_view(), name='entry'),
    path('main/', views.MainView.as_view(), name='main_test'),
    path('aboutUs/', views.AboutUs.as_view(), name='aboutUs'),
    # path('entry/ajax/dummy_save/', views.savePolygon, name='savePolygon')
>>>>>>> FrontAnimation
]

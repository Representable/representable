from django.urls import path

from . import views

app_name = "main"
urlpatterns = [
    path('', views.Index.as_view(), name='index'),
    path('timeline/', views.Timeline.as_view(), name='timeline'),
    path('thanks/', views.Thanks.as_view(), name='thanks'),
    path('form/', views.CommunityView.as_view(), name='community_form')
]

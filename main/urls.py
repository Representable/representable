#
# Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
#
# This file is part of Representable
# (see http://representable.org).
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
from django.urls import include, path

from . import views
from representable.settings.base import MAPBOX_KEY

app_name = "main"
urlpatterns = [
    path("", views.main.Index.as_view(), name="index"),
    path("map/", views.main.Map.as_view(), name="map"),
    path("thanks/", views.main.Thanks.as_view(), name="thanks"),
    path("entry/", views.main.EntryView.as_view(), name="entry"),
    path("about/", views.main.About.as_view(), name="about"),
    path("review/", views.main.Review.as_view(), name="review"),
    path("privacy/", views.main.Privacy.as_view(), name="privacy"),
    path("terms/", views.main.Terms.as_view(), name="terms"),
    path("submission/", views.main.Submission.as_view(), name="submission"),
    path(
        "campaigns/", views.campaigns.IndexView.as_view(), name="campaign_list"
    ),
    path("partners/", views.partners.IndexView.as_view(), name="partner_list"),
    path(
        "partners/<slug:slug>/",
        views.partners.PartnerView.as_view(),
        name="partner_page",
    ),
    path(
        "campaigns/<int:cam_pk>/",
        views.campaigns.CampaignView.as_view(),
        name="campaign_page",
    ),
    path("dashboard/", views.dashboard.IndexView.as_view(), name="dashboard"),
    path(
        "dashboard/partners/create/",
        views.dashboard.CreateOrg.as_view(),
        name="create_org",
    ),
    path(
        "dashboard/partners/<slug:slug>-<int:pk>/",
        include(
            [
                path("", views.dashboard.HomeOrg.as_view(), name="home_org"),
                path(
                    "thanks/",
                    views.dashboard.ThanksOrg.as_view(),
                    name="thanks_org",
                ),
                path(
                    "edit/", views.dashboard.EditOrg.as_view(), name="edit_org"
                ),
                path(
                    "upload-whitelist/",
                    views.WhiteListUpdate.as_view(),
                    name="upload_whitelist",
                ),
                path(
                    "campaigns/",
                    views.dashboard.CampaignList.as_view(),
                    name="campaign_list",
                ),
                path(
                    "campaigns/create/",
                    views.dashboard.CreateCampaign.as_view(),
                    name="create_campaign",
                ),
                path(
                    "campaigns/<int:cam_pk>/",
                    views.dashboard.CampaignHome.as_view(),
                    name="campaign_home",
                ),
                path(
                    "campaigns/<int:cam_pk>/edit/",
                    views.dashboard.UpdateCampaign.as_view(),
                    name="update_campaign",
                ),
            ]
        ),
    ),
]

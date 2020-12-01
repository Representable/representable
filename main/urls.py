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
    path(
        "accounts/login/",
        views.main.RepresentableLoginView.as_view(),
        name="account_login",
    ),
    path(
        "accounts/signup/",
        views.main.RepresentableSignupView.as_view(),
        name="account_signup",
    ),
    path("", views.main.Index.as_view(), name="index"),
    path("map/", views.main.Map.as_view(), name="map"),
    path(
        "entry_preview/",
        views.main.EntryPreview.as_view(),
        name="entry_preview",
    ),
    path(
        "entry_state_selection/",
        views.main.EntryStateSelection.as_view(),
        name="entry_state_selection",
    ),
    path(
        "entry/",
        views.main.EntryView.as_view(),
        {"token": "", "drive": ""},
        name="entry",
    ),
    path(
        "entry/drive/<slug:drive>/",
        views.main.EntryView.as_view(),
        {"token": "", "abbr": ""},
        name="entry",  # deprecated? every drive page should redirect to incl. abbr
    ),
    path(
        "entry/drive/<slug:drive>/<abbr>",
        views.main.EntryView.as_view(),
        {"token": ""},
        name="entry",
    ),
    path(
        "entry/c/<slug:drive>/",
        views.main.EntryView.as_view(),
        {"token": ""},
        name="entry_legacy",  # for old links
    ),
    path(
        "entry/t/<token>/",
        views.main.EntryView.as_view(),
        {"drive": ""},
        name="entry",
    ),
    path(
        "entry/t/<token>/<abbr>/",
        views.main.EntryView.as_view(),
        {"drive": ""},
        name="entry",
    ),
    path(
        "entry/<abbr>/",
        views.main.EntryView.as_view(),
        {"token": "", "state": "", "drive": ""},
        name="entry",
    ),
    path("about/", views.main.About.as_view(), name="about"),
    path("review/", views.main.Review.as_view(), name="review"),
    path("privacy/", views.main.Privacy.as_view(), name="privacy"),
    path("terms/", views.main.Terms.as_view(), name="terms"),
    path("state/<abbr>/", views.main.StatePage.as_view(), name="state"),
    path("submission/", views.main.Submission.as_view(), name="submission"),
    path("blog/", views.main.Blog.as_view(), name="blog"),
    path(
        "submission/<map_id>",
        views.main.Submission.as_view(),
        {"slug": "", "drive": ""},
        name="submission",
    ),
    path(
        "submission/<map_id>/<abbr>",
        views.main.Submission.as_view(),
        {"slug": "", "drive": ""},
        name="submission",
    ),
    path(
        "submission/thanks/<map_id>/<abbr>",
        views.main.Submission.as_view(),
        {"slug": "", "drive": ""},
        name="thanks",
    ),
    path(
        "thanks/drive/<slug:slug>/<slug:drive>/<map_id>",
        views.main.Thanks.as_view(),
        name="thanks",
    ),
    path("export/", views.main.ExportView.as_view(), name="export"),
    path("export/<abbr>/", views.main.ExportView.as_view(), name="export"),
    path(
        "multiexport/drive/<drive>",
        views.partners.MultiExportView.as_view(),
        name="multi_export",
    ),
    path(
        "multiexport/org/<org>",
        views.partners.MultiExportView.as_view(),
        name="multi_export",
    ),
    path("partners/", views.partners.IndexView.as_view(), name="partner_list"),
    path(
        "partners/welcome/",
        views.partners.WelcomeView.as_view(),
        name="partner_welcome",
    ),
    path(
        "partners/<slug:slug>/",
        views.partners.PartnerView.as_view(),
        name="partner_page",
    ),
    path(
        "map/p/<slug:slug>/",
        views.partners.PartnerMap.as_view(),
        {"drive": ""},
        name="partner_map",
    ),
    path(
        "map/p/<slug:slug>/<slug:drive>/",
        views.partners.PartnerMap.as_view(),
        name="partner_map",
    ),
    path(
        "report/",
        views.partners.ReportView.as_view(),
        name="report_community",
    ),
    path(
        "drive/<slug:slug>/",
        views.drives.DriveView.as_view(),
        name="drive_page",
    ),
    # keeping this for now to maintain link to user testing campaign
    path(
        "c/<slug:slug>/",
        views.drives.DriveView.as_view(),
        name="drive_page_legacy",
    ),
    path("dashboard/", views.dashboard.IndexView.as_view(), name="dashboard"),
    path(
        "dashboard/entries/<int:pk>",
        views.dashboard.ViewEntry.as_view(),
        name="dash_entry_list",
    ),
    path(
        "dashboard/entries/<int:pk>",
        views.dashboard.ViewEntry.as_view(),
        name="dash_view_entry",
    ),
    path(
        "dashboard/entries/<int:pk>/delete/",
        views.dashboard.DeleteEntry.as_view(),
        name="dash_delete_entry",
    ),
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
                    "delete/",
                    views.dashboard.DeleteOrg.as_view(),
                    name="delete_org",
                ),
                path(
                    "members/",
                    views.dashboard.ManageOrg.as_view(),
                    name="manage_org",
                ),
                path(
                    "members/create",
                    views.dashboard.CreateMember.as_view(),
                    name="create_member",
                ),
                path(
                    "upload-allowlist/",
                    views.AllowListUpdate.as_view(),
                    name="upload_allowlist",
                ),
                path(
                    "drives/create/",
                    views.dashboard.CreateDrive.as_view(),
                    name="create_drive",
                ),
                path(
                    "drives/<uuid:cam_pk>/",
                    views.dashboard.DriveHome.as_view(),
                    name="drive_home",
                ),
                path(
                    "drives/<uuid:cam_pk>/edit/",
                    views.dashboard.UpdateDrive.as_view(),
                    name="update_drive",
                ),
                path(
                    "drives/<uuid:cam_pk>/delete/",
                    views.dashboard.DeleteDrive.as_view(),
                    name="delete_drive",
                ),
            ]
        ),
    ),
]

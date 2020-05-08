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
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.views.generic import (
    TemplateView,
    ListView,
    CreateView,
    UpdateView,
    DetailView,
    DeleteView,
)
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from allauth.account.decorators import verified_email_required
from ..forms import (
    CommunityForm,
    CampaignForm,
    DeletionForm,
    OrganizationForm,
    WhitelistForm,
    MemberForm,
)
from ..models import (
    Membership,
    Organization,
    WhiteListEntry,
    Campaign,
    CommunityEntry,
    Tag,
)
from django.shortcuts import get_object_or_404
from django.views.generic.edit import FormView
from django.urls import reverse, reverse_lazy

from django.contrib.auth.models import Group
from itertools import islice
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

from shapely.geometry import mapping
import geojson
import os
import json
import re
import csv
from state_abbrev import us_state_abbrev
import hashlib
from django.http import JsonResponse
import shapely.wkt
import reverse_geocoder as rg

# ******************************************************************************#


class OrgAdminRequiredMixin(UserPassesTestMixin):
    """
    Checks if the user has administrative permissions for the given organization (checked through the pk field)
    """

    def test_func(self):
        return self.request.user.is_org_admin(self.kwargs["pk"])


# ******************************************************************************#


class OrgModRequiredMixin(UserPassesTestMixin):
    """
    Checks if the user has moderator permissions for the given organization (checked through the pk field)
    """

    def test_func(self):
        return self.request.user.is_org_moderator(self.kwargs["pk"])


# ******************************************************************************#


class IndexView(LoginRequiredMixin, ListView):
    """
    The dashboard home page.
    """

    context_object_name = "org_list"
    template_name = "main/dashboard/index.html"

    def get_queryset(self):
        # returns all the organizations that the user is a member of
        return Organization.objects.filter(
            membership__member=self.request.user
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["campaigns"] = Campaign.objects.filter(
            organization__in=self.get_queryset()
        )
        return context


# ******************************************************************************#
class EntryListView(LoginRequiredMixin, ListView):
    model = CommunityEntry
    template_name = "main/dashboard/entries/list.html"


class ViewEntry(LoginRequiredMixin, DetailView):
    model = CommunityEntry
    template_name = "main/dashboard/entries/index.html"


class DeleteEntry(LoginRequiredMixin, DeleteView):
    model = CommunityEntry
    success_url = reverse_lazy("dash_entry_list")


class CreateOrg(LoginRequiredMixin, CreateView):
    """
    The view with a form to create an organization.
    """

    template_name = "main/dashboard/partners/create.html"
    form_class = OrganizationForm

    def form_valid(self, form):
        org = form.save()
        # by default, make the user creating the org the admin
        admin = Membership(
            member=self.request.user,
            organization=org,
            is_org_admin=True,
            is_org_moderator=True,
            is_whitelisted=True,
        )
        admin.save()

        self.success_url = reverse_lazy(
            "main:thanks_org", kwargs=org.get_url_kwargs()
        )

        return super().form_valid(form)


# ******************************************************************************#


class ThanksOrg(LoginRequiredMixin, TemplateView):
    """
    The view that indicates a user has successfully created an organization.
    """

    template_name = "main/dashboard/partners/thanks.html"


class EditOrg(LoginRequiredMixin, OrgAdminRequiredMixin, UpdateView):
    """
    The view to update an organization details.
    """

    template_name = "main/dashboard/partners/edit.html"
    form_class = OrganizationForm
    model = Organization


# ******************************************************************************#


class HomeOrg(LoginRequiredMixin, DetailView):
    """
    The admin home page for an organization within the dashboard
    """

    template_name = "main/dashboard/partners/index.html"
    model = Organization
    pk_url_kwarg = "pk"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["is_org_admin"] = self.request.user.is_org_admin(
            self.object.id
        )
        context["is_org_moderator"] = self.request.user.is_org_moderator(
            self.object.id
        )

        return context


# ******************************************************************************#


class ManageOrg(LoginRequiredMixin, OrgAdminRequiredMixin, TemplateView):
    template_name = "main/dashboard/partners/membership.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        members = Membership.objects.filter(organization__pk=self.kwargs["pk"])
        context["organization"] = Organization.objects.get(
            id=self.kwargs["pk"]
        )
        context["header"] = ["Email", "Permissions", "Date Joined"]
        context["members"] = members

        return context


class CreateMember(LoginRequiredMixin, OrgAdminRequiredMixin, FormView):
    model = Membership
    form_class = MemberForm
    template_name = "main/dashboard/partners/member_form.html"

    def get_queryset(self):
        queryset = Membership.objects.filter(
            organization__pk=self.kwargs["pk"]
        )
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        members = Membership.objects.filter(organization__pk=self.kwargs["pk"])
        context["organization"] = Organization.objects.get(
            id=self.kwargs["pk"]
        )
        context["header"] = ["Email", "Permissions", "Date Joined"]
        context["members"] = members

        return context

    def form_valid(self, form):
        form.instance.organization = get_object_or_404(
            Organization, pk=self.kwargs["pk"]
        )
        member = Membership.objects.filter(
            organization__pk=self.kwargs["pk"], member=form.instance.member
        )
        if member:
            member.update(
                is_org_admin=form.instance.is_org_admin,
                is_org_moderator=form.instance.is_org_moderator,
                is_whitelisted=form.instance.is_whitelisted,
            )
        else:
            # create new member with the given permissions
            new_member = Membership(
                member=form.instance.member,
                organization=form.instance.organization,
                is_org_admin=form.instance.is_org_admin,
                is_org_moderator=form.instance.is_org_moderator,
                is_whitelisted=form.instance.is_whitelisted,
            )
            new_member.save()

        self.success_url = reverse_lazy(
            "main:home_org", kwargs=form.instance.organization.get_url_kwargs()
        )
        return super().form_valid(form)


class WhiteListUpdate(LoginRequiredMixin, OrgAdminRequiredMixin, UpdateView):
    """
    The form to update the whitelist
    """

    form_class = WhitelistForm
    model = Organization
    template_name = "main/dashboard/partners/whitelist_upload.html"
    pk_url_kwarg = "pk"

    def form_valid(self, form):
        file = self.request.FILES["file"]
        emails = []
        max_line_count = 10000
        line_count = 0
        for line in file:
            # TODO: should throw error when reach line count instead to alert user
            while line_count < max_line_count:
                matches = re.findall(
                    b"[\w\.-]+@[\w\.-]+\.\w+", line
                )  # noqa: W605
                for match in matches:
                    entry = WhiteListEntry(
                        email=match.decode("utf-8"), organization=self.object
                    )
                    emails.append(entry)
                line_count += 1

        # TODO: fix below batch code
        # batch
        batch_size = 10000
        WhiteListEntry.objects.bulk_create(emails, batch_size)
        # while True:
        #     batch = list(islice(emails, batch_size))
        #     if not batch:
        #         break
        #     self.object.whitelist.bulk_create(batch, batch_size)

        # self.success_url = reverse_lazy(
        #     "main:home_org", kwargs=self.object.get_url_kwargs()
        # )

        return super().form_valid(form)


class ReviewOrg(LoginRequiredMixin, OrgModRequiredMixin, TemplateView):
    """
    Page for organization to review submissions
    """

    template_name = "main/dashboard/partners/review.html"
    form_class = DeletionForm
    initial = {"key": "value"}

    # https://www.agiliq.com/blog/2019/01/django-formview/
    def get_initial(self):
        initial = self.initial
        if self.request.user.is_authenticated:
            initial.update({"user": self.request.user})
        return initial

    def get_context_data(self, **kwargs):
        form = self.form_class(initial=self.get_initial(), label_suffix="")

        # the polygon coordinates
        entryPolyDict = {}

        # approved list of communities
        approvedList = []

        query = CommunityEntry.objects.filter(
            organization__pk=self.kwargs["pk"]
        )
        for obj in query:
            if not obj.census_blocks_polygon:
                s = "".join(obj.user_polygon.geojson)
            else:
                s = "".join(obj.census_blocks_polygon.geojson)
            struct = geojson.loads(s)
            entryPolyDict[obj.entry_ID] = struct.coordinates
            if obj.admin_approved:
                # this is for coloring the map properly
                approvedList.append(obj.entry_ID)

        context = {
            "form": form,
            "entries": json.dumps(entryPolyDict),
            "approved": json.dumps(approvedList),
            "communities": query,
            "mapbox_key": os.environ.get("DISTR_MAPBOX_KEY"),
            "mapbox_user_name": os.environ.get("MAPBOX_USER_NAME"),
        }
        return context

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, label_suffix="")

        # TODO: verify that unauthorized users cannot use this post method
        if form.is_valid():
            query = CommunityEntry.objects.filter(
                entry_ID=request.POST.get("c_id")
            )
            entry = query[0]
            # TODO check whether authorized to edit state?
            if (
                "Approve" in request.POST
            ):  # TODO need someone to review security
                entry.admin_approved = True
                entry.save()
            elif "Unapprove" in request.POST:
                entry.admin_approved = False
                entry.save()
            elif "Delete" in request.POST:
                entry.delete()
        context = (
            self.get_context_data()
        )  # TODO: Is there a problem with this?
        return render(request, self.template_name, context)


class CampaignHome(LoginRequiredMixin, DetailView):
    """
    BETA view: the campaign home
    Note: url rewrites currently not working with the given pk_url_kwarg.
    """

    template_name = "main/dashboard/campaigns/index.html"
    model = Campaign
    pk_url_kwarg = "cam_pk"


class CampaignList(LoginRequiredMixin, TemplateView):
    """
    BETA view: the dashboard list of campaigns
    Note: url rewrites currently not working with the given pk_url_kwarg.
    """

    template_name = "main/dashboard/campaigns/list.html"
    # model = Campaign
    # #campaigns = Campaign.objects.all()
    # pk_url_kwarg = 'cam_pk'
    # #
    # def get_queryset(self):
    #    org = get_object_or_404(Organization, pk=self.kwargs["pk"])
    #    return super(CampaignList, self).get_queryset().filter(organization=org)
    # def get_queryset(self):
    #     print(self.kwargs)
    #     org = get_object_or_404(Organization, pk=self.kwargs["pk"])
    #     return Campaign.objects.all()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["is_org_admin"] = self.request.user.is_org_admin(
            self.kwargs["pk"]
        )
        context["is_org_moderator"] = self.request.user.is_org_moderator(
            self.kwargs["pk"]
        )
        context["org"] = get_object_or_404(Organization, pk=self.kwargs["pk"])
        context[
            "campaigns"
        ] = (
            Campaign.objects.all()
        )  # filter(organization__id=self.kwargs["pk"])

        return context


class CreateCampaign(LoginRequiredMixin, CreateView):
    """
    BETA view: the view for the form to create a campaign
    """

    template_name = "main/dashboard/campaigns/create.html"
    form_class = CampaignForm
    pk_url_kwarg = "cam_pk"

    def form_valid(self, form):
        # TODO: include a check to make sure this actually the user's org
        form.instance.organization = get_object_or_404(
            Organization, pk=self.kwargs["pk"]
        )
        object = form.save()

        self.success_url = reverse_lazy(
            "main:campaign_home",
            kwargs={
                "pk": self.kwargs["pk"],
                "slug": self.kwargs["slug"],
                "cam_pk": object.id,
            },
        )

        return super().form_valid(form)


class UpdateCampaign(LoginRequiredMixin, UpdateView):
    """
    BETA view: the view for the form to update campaign details
    """

    template_name = "main/dashboard/campaigns/update.html"
    form_class = CampaignForm
    pk_url_kwarg = "cam_pk"

    def form_valid(self, form):
        # TODO: include a check to make sure this actually the user's org
        form.instance.organization = get_object_or_404(
            Organization, pk=self.kwargs["pk"]
        )

        object = form.save()

        self.success_url = reverse_lazy(
            "main:campaign_home",
            kwargs={
                "pk": self.kwargs["pk"],
                "slug": self.kwargs["slug"],
                "cam_pk": object.id,
            },
        )

        return super().form_valid(form)

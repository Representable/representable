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
)
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from allauth.account.decorators import verified_email_required
from django.forms import formset_factory
from ..forms import (
    CommunityForm,
    CampaignForm,
    IssueForm,
    DeletionForm,
    OrganizationForm,
    WhitelistUploadForm,
)
from ..models import (
    Membership,
    Organization,
    WhiteListEntry,
    Campaign,
)
from django.shortcuts import get_object_or_404
from django.views.generic.edit import FormView
from django.urls import reverse, reverse_lazy
import re

from django.contrib.auth.models import Group
from itertools import islice
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

# ******************************************************************************#


class OrgAdminRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_org_admin(self.kwargs["pk"])


# ******************************************************************************#


class OrgModRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_org_moderator(self.kwargs["pk"])


# ******************************************************************************#


class IndexView(LoginRequiredMixin, ListView):
    context_object_name = "org_list"
    template_name = "main/dashboard/index.html"

    def get_queryset(self):
        return Organization.objects.filter(
            membership__member=self.request.user
        )

    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super().get_context_data(**kwargs)
        context["campaigns"] = Campaign.objects.filter(
            organization__in=self.get_queryset()
        )
        return context


# ******************************************************************************#


class CreateOrg(LoginRequiredMixin, CreateView):
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

        admins = Group.objects.create(name=("admins_" + str(org.id)))
        mods = Group.objects.create(name=("mods_" + str(org.id)))

        content_type = ContentType.objects.get_for_model(Organization)
        admin_permission = Permission.objects.create(
            codename="org_admin_" + str(org.id),
            name="Org Admin " + str(org.name),
            content_type=content_type,
        )
        mod_permission = Permission.objects.create(
            codename="org_moderator_" + str(org.id),
            name="Org Moderator " + org.name,
            content_type=content_type,
        )

        admins.permissions.add(admin_permission)
        mods.permissions.add(mod_permission)

        admins.user_set.add(self.request.user)
        mods.user_set.add(self.request.user)

        self.success_url = reverse_lazy(
            "main:thanks_org", kwargs=org.get_url_kwargs()
        )

        return super().form_valid(form)


# ******************************************************************************#


class ThanksOrg(LoginRequiredMixin, TemplateView):
    template_name = "main/dashboard/partners/thanks.html"


class EditOrg(LoginRequiredMixin, OrgAdminRequiredMixin, UpdateView):
    template_name = "main/dashboard/partners/edit.html"
    model = Organization
    fields = ["name", "description", "ext_link"]


# ******************************************************************************#


class HomeOrg(LoginRequiredMixin, DetailView):
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


class WhiteListUpdate(LoginRequiredMixin, OrgAdminRequiredMixin, UpdateView):
    form_class = OrganizationForm
    model = Organization
    template_name = "main/dashboard/partners/whitelist_upload.html"
    pk_url_kwarg = "pk"

    def form_valid(self, form):
        file = self.request.FILES["file"]
        emails = []
        max_line_count = 10000
        line_count = 0
        for line in file:

            matches = re.findall(b"[\w\.-]+@[\w\.-]+\.\w+", line)  # noqa: W605
            for match in matches:
                entry = WhiteListEntry(
                    email=match.decode("utf-8"), organization=self.object
                )
                emails.append(entry)
            line_count += 1
            # TODO: should throw error instead
            if line_count == max_line_count:
                break
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


class CampaignHome(LoginRequiredMixin, DetailView):
    template_name = "main/dashboard/campaigns/index.html"
    model = Campaign
    pk_url_kwarg = "cam_pk"


class CampaignList(LoginRequiredMixin, TemplateView):
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

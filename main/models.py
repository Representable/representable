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
from django.contrib.postgres.fields import ArrayField
from django.template.defaultfilters import slugify
from django.urls import reverse, reverse_lazy

# Geo App
import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Group
from django.db import migrations
from django.contrib.gis.db import models
from .choices import (
    STATES,
    POLICY_ISSUES,
)
from .utils import generate_unique_slug

# ******************************************************************************#


class User(AbstractUser):
    # TODO: Add a language variable for each user
    def is_org_admin(self, org_id):
        group = "admins_" + str(org_id)
        return self.groups.filter(name=group).exists()

    def is_org_moderator(self, org_id):
        group = "mods_" + str(org_id)
        return self.groups.filter(name=group).exists()


# ******************************************************************************#


class Tag(models.Model):
    """
    Referenced https://docs.djangoproject.com/en/2.2/topics/forms/modelforms/#a-full-example
    The tag table stores tags associated with different entries.
    """

    name = models.CharField(max_length=100, primary_key=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return self.name


# ******************************************************************************#


class Organization(models.Model):
    """
    Organization represents organizations with a user
    Fields included:
    - name: name of the organization
    - description: description of the organization
    - ext_link: external link to organization website
    - slug: internal representable link slug
    - members: members of the organization
    """

    name = models.CharField(max_length=128)
    description = models.CharField(max_length=250, blank=True)
    ext_link = models.URLField(max_length=200, blank=True)
    states = ArrayField(
        models.CharField(max_length=50, choices=STATES, blank=True),
        blank=False,
    )
    slug = models.SlugField(unique=True)
    members = models.ManyToManyField(User, through="Membership")

    class Meta:
        ordering = ("description",)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # generate the slug once the first time the org is created
        if not self.slug:
            self.slug = generate_unique_slug(Organization, self.name)
        super(Organization, self).save(*args, **kwargs)

    def get_url_kwargs(self):
        return {"pk": self.id, "slug": self.slug}

    def get_absolute_url(self):
        return reverse("main:home_org", kwargs=self.get_url_kwargs())


# ******************************************************************************#


class Membership(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    date_joined = models.DateField(auto_now_add=True, blank=True)
    is_org_admin = models.BooleanField(default=False)
    is_org_moderator = models.BooleanField(default=False)
    is_whitelisted = models.BooleanField(default=False)


# ******************************************************************************#


class WhiteListEntry(models.Model):
    """
    A given whitelist entry with the following
    fields included:
    - email: whitelisted email
    - organization: the organization that created the link
    - date added: when the email was added to the whitelist
    """

    email = models.CharField(max_length=128)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    date_added = models.DateField(auto_now_add=True, blank=True)

    class Meta:
        ordering = ("email",)

    def __str__(self):
        return self.email


# ******************************************************************************#


class CommunityEntry(models.Model):
    """
    Community Entry represents the entry created by the user when drawing their
    COI.
    Fields included:
     - user: The user that created the entry. Foreign Key = User (Many to One)
     - entry_ID: Randomly Generated via uuid.uuid4.
     - organization: The organization that the user is submitting the entry to
     - user_polygon:  User polygon contains the polygon drawn by the user.
     - census_blocks_polygon_array: Array containing multiple polygons.
     - census_blocks_polygon: The union of the census block polygons.

    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    entry_ID = models.CharField(
        max_length=100, blank=False, unique=True, default=uuid.uuid4
    )
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, blank=True, null=True
    )
    user_polygon = models.PolygonField(
        geography=True, serialize=True, blank=False
    )
    census_blocks_polygon_array = ArrayField(
        models.PolygonField(
            geography=True, blank=True, null=True, serialize=True
        ),
        blank=True,
        null=True,
    )
    census_blocks_polygon = models.MultiPolygonField(
        geography=True, serialize=True, blank=True, null=True
    )
    tags = models.ManyToManyField(Tag, blank=True)
    CHOICES = (
        ("Y", "Yes, this is my community."),
        (
            "N",
            "No, I am creating this community on behalf of another group of people.",
        ),
    )
    entry_name = models.CharField(
        max_length=100, blank=False, unique=False, default="Community_name"
    )
    entry_reason = models.TextField(
        max_length=500, blank=True, unique=False, default=""
    )
    my_community = models.CharField(
        "Is this your community?",
        max_length=1,
        choices=CHOICES,
        default="Y",
        blank=False,
        null=False,
    )
    admin_approved = models.BooleanField(default=False)

    def __str__(self):
        return str(self.entry_ID)

    class Meta:
        db_table = "community_entry"


# ******************************************************************************#


class Issue(models.Model):
    """
    Issue holds issues associated with each community entry.
    Fields included:
        - entry: Foreign Key that associates the issue to the entry.
        - category: Category associated with issue.
        - description: Description.
    """

    entry = models.ForeignKey(
        CommunityEntry, on_delete=models.CASCADE, default=None
    )
    category = models.CharField(
        max_length=50, choices=POLICY_ISSUES, default=None, blank=True
    )
    description = models.CharField(max_length=250, blank=True)

    class Meta:
        ordering = (
            "category",
            "description",
        )

    def __str__(self):
        return self.description


# ******************************************************************************#


class Campaign(models.Model):
    """
    Campaign represents an organization's entry collection campaign.
    - name: name of the campaign
    - state: the state of the campaign
    - description: description of the campaign
    - organization: organization hosting the campaign
    - start_date: when the campaign starts data collection
    - end_date: when the campaign ends data collection
    - is_active: is the campaign active
    """

    name = models.CharField(max_length=128)
    description = models.CharField(max_length=250, blank=True)
    state = models.CharField(
        max_length=50, choices=STATES, default=None, blank=False
    )
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("description",)

    def __str__(self):
        return self.name

    # def get_absolute_url(self):
    #     return reverse("main:campaign_home", kwargs={"org_pk": self.id})

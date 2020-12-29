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
from .choices import STATES
from .utils import generate_unique_slug, generate_unique_token

# state model editable content field
from ckeditor.fields import RichTextField

# ******************************************************************************#


class User(AbstractUser):
    # TODO: Add a language variable for each user
    def is_org_admin(self, org_id):
        if Membership.objects.filter(
            member=self, organization__pk=org_id, is_org_admin=True
        ):
            return True
        else:
            return False

    def is_generic_admin(self):
        if Membership.objects.filter(member=self, is_org_admin=True):
            return True
        else:
            return False

    def get_organizations(self):
        return Organization.objects.filter(
            membership__member=self, membership__is_org_admin=True
        )


# ******************************************************************************#


class Organization(models.Model):
    """
    Organization represents organizations with a user
    Fields included:
    - name: name of the organization
    - description: description of the organization
    - ext_link: external link to organization website
    - states: the states that the organization operates in
    - slug: internal representable link slug
    - members: members of the organization
    """

    name = models.CharField(max_length=128)
    description = models.CharField(max_length=500, blank=True)
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
    is_org_admin = models.BooleanField(default=True)

    def get_absolute_url(self):
        return reverse(
            "main:home_org",
            kwargs={
                "slug": self.organization.slug,
                "pk": self.organization.id,
            },
        )


# ******************************************************************************#


class AllowList(models.Model):
    """
    A given allowlist entry with the following
    fields included:
    - email: allowlisted email
    - organization: the organization that created the link
    - date added: when the email was added to the allowlist
    """

    email = models.CharField(max_length=128)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    date_added = models.DateField(auto_now_add=True, blank=True)

    class Meta:
        ordering = ("email",)

    def __str__(self):
        return self.email


# ******************************************************************************#


class Drive(models.Model):
    """
    Drive represents an organization's entry collection drive.
    - id: uuid for drives
    - slug: slug of drive
    - name: name of the drive
    - state: the state of the drive
    - description: description of the drive
    - organization: organization hosting the drive
    - created_at: when the drive was created
    - is_active: is the drive active
    - require_user_addresses: does the drive require users to include an address
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=255, null=True, unique=True)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=700, blank=True, null=True)
    state = models.CharField(
        max_length=50, choices=STATES, default=None, blank=False
    )
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    require_user_addresses = models.BooleanField(default=True, blank=True, null=True)

    class Meta:
        ordering = ("description",)

    def save(self, *args, **kwargs):
        # generate the slug once the first time the org is created
        if not self.slug:
            self.slug = generate_unique_slug(Drive, self.name)
        super(Drive, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse(
            "main:drive_home",
            kwargs={
                "slug": self.organization.slug,
                "pk": self.organization.id,
                "cam_pk": self.id,
            },
        )

    def __str__(self):
        return self.name


# ******************************************************************************#
class DriveToken(models.Model):
    drive = models.ForeignKey(Drive, on_delete=models.CASCADE)
    token = models.CharField(max_length=100)

    def save(self, *args, **kwargs):
        # generate the unique token once the first time the token is created
        if not self.token:
            self.token = generate_unique_token(self.drive.name)
        super(DriveToken, self).save(*args, **kwargs)


# ******************************************************************************#


class BlockGroup(models.Model):
    """
    BlockGroup represents census block groups from a given year. These are the building blocks of COIs.
    Fields included:
     - census_id: the official block group id
     - year: year of census (default - 2010, though this should be changed when 2020 blocks come out)
    """

    census_id = models.CharField(max_length=12)
    year = models.IntegerField(default=2010)


# ******************************************************************************#


class CommunityEntry(models.Model):
    """
    Community Entry represents the entry created by the user when drawing their
    COI.
    Fields included:
     - user: The user that created the entry. Foreign Key = User (Many to One)
     - entry_ID: Randomly Generated via uuid.uuid4.
     - organization: The organization that the user is submitting the entry to
     - drive: The drive that the user is submitting the entry to
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
        Organization,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="submissions",
    )
    drive = models.ForeignKey(
        Drive,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="submissions",
    )
    user_polygon = models.PolygonField(
        geography=True, serialize=True, blank=True, null=True
    )
    census_blocks_polygon_array = ArrayField(
        models.PolygonField(
            geography=True, blank=True, null=True, serialize=True
        ),
        blank=True,
        null=True,
    )
    census_blocks_polygon = models.GeometryField(
        geography=True, serialize=True, blank=True, null=True
    )

    block_groups = models.ManyToManyField(BlockGroup, blank=True)

    entry_name = models.CharField(
        max_length=100, blank=False, unique=False, default=""
    )
    entry_reason = models.TextField(
        max_length=500, blank=True, unique=False, default=""
    )
    user_name = models.CharField(
        max_length=500, blank=False, unique=False, default=""
    )
    cultural_interests = models.TextField(
        max_length=500, blank=True, unique=False, default=""
    )
    economic_interests = models.TextField(
        max_length=500, blank=True, unique=False, default=""
    )
    comm_activities = models.TextField(
        max_length=500, blank=True, unique=False, default=""
    )
    other_considerations = models.TextField(
        max_length=500, blank=True, unique=False, default=""
    )
    state = models.CharField(
        max_length=10, blank=True, unique=False, default=""
    )
    created_at = models.DateTimeField(auto_now_add=True)
    admin_approved = models.BooleanField(default=True)

    def __str__(self):
        return str(self.entry_ID)

    class Meta:
        db_table = "community_entry"


class Address(models.Model):
    entry = models.ForeignKey(
        CommunityEntry, on_delete=models.CASCADE, default=""
    )
    street = models.CharField(
        max_length=500, blank=True, unique=False, default=""
    )
    city = models.CharField(
        max_length=100, blank=True, unique=False, default=""
    )
    state = models.CharField(
        max_length=100, blank=True, unique=False, default=""
    )
    zipcode = models.CharField(
        max_length=12, blank=True, unique=False, default=""
    )

    def __str__(self):
        return str(self.street)

    class Meta:
        ordering = ("entry",)


# ******************************************************************************#


class State(models.Model):

    name = models.CharField(
        max_length=500, blank=False, unique=False, default=""
    )
    abbr = models.CharField(max_length=2, blank=False, unique=True, default="")

    content_news = RichTextField()
    content_criteria = RichTextField()
    content_coi = RichTextField()

    def get_drives(self):
        return Drive.objects.filter(state=self.abbr.upper())

    get_drives.allow_tags = True

    class Meta:
        db_table = "state"


# ******************************************************************************#


class FrequentlyAskedQuestion(models.Model):

    question = models.CharField(
        max_length=500, blank=False, unique=True, default=""
    )
    answer = models.CharField(max_length=1000, blank=False, unique=True, default="")

    class Meta:
        db_table = "faq"


# ******************************************************************************#


class GlossaryDefinition(models.Model):

    term = models.CharField(
        max_length=100, blank=False, unique=True, default=""
    )
    definition = models.CharField(max_length=1000, blank=False, unique=True, default="")

    class Meta:
        db_table = "glossary"


# ******************************************************************************#
class Report(models.Model):
    community = models.ForeignKey(
        CommunityEntry, on_delete=models.CASCADE, related_name="reports"
    )
    email = models.CharField(max_length=128)

    timestamp = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def unapprove(self):
        self.community.admin_approved = False
        self.community.save()


# ******************************************************************************#

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

# Geo App
import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import migrations
from django.contrib.gis.db import models
import datetime
from .choices import (
    RACE_CHOICES,
    RELIGION_CHOICES,
    INDUSTRY_CHOICES,
)

# ******************************************************************************#


class User(AbstractUser):
    # TODO: Add a language variable for each user
    pass


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


class CommunityEntry(models.Model):
    """
    Community Entry represents the entry created by the user when drawing their
    COI.
    Fields included:
     - user: The user that created the entry. Foreign Key = User (Many to One)
     - entry_ID: Randomly Generated via uuid.uuid4.
     - user_polygon:  User polygon contains the polygon drawn by the user.
     - census_blocks_polygon_array: Array containing multiple polygons.
     - census_blocks_polygon: The union of the census block polygons.

     References:
     FK, Many-to-One: https://docs.djangoproject.com/en/2.2/topics/db/examples/many_to_one/

    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    entry_ID = models.CharField(
        max_length=100, blank=False, unique=True, default=uuid.uuid4
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

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
from django import forms
from django.forms import ModelForm
from django_select2.forms import (
    Select2MultipleWidget,
    Select2Widget,
    ModelSelect2Widget,
)
from .models import (
    CommunityEntry,
    Organization,
    Drive,
    Membership,
    User,
    Address,
)
from .choices import STATES
from django.contrib.gis.db import models
from django.contrib.gis.measure import Area

# https://django-select2.readthedocs.io/en/latest/django_select2.html


class AddressForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    class Meta:
        model = Address
        fields = ["city", "state", "zipcode", "street"]

        widgets = {
            "street": forms.TextInput(attrs={"placeholder": "Street"}),
            "city": forms.TextInput(attrs={"placeholder": "City"}),
            "state": forms.TextInput(attrs={"placeholder": "State"}),
            "zipcode": forms.TextInput(attrs={"placeholder": "Zipcode"}),
        }
        labels = {
            "street": "Street: ",
            "city": "City: ",
            "state": "State: ",
            "zipcode": "Zipcode: "
        }
    # def clean(self):
    #     """
    #     Check that the address is included with a submission, if the drive requires it
    #     """
    #
    #     if errors:
    #         raise forms.ValidationError(errors)


class CommunityForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["census_blocks_polygon_array"].delimiter = "|"

    class Meta:
        model = CommunityEntry
        fields = "__all__"
        user_polygon = models.PolygonField(
            error_messages={
                "required": "User polygon missing. Please draw your community."
            }
        )
        # census_blocks_polygon_array = models.PolygonField(
        #     error_messages={"required": "Census blocks array missing."}
        # )
        census_blocks_polygon = models.GeometryField(
            error_messages={"required": "Census blocks polygon missing."}
        )
        widgets = {
            "user": forms.HiddenInput(),
            "entry_ID": forms.HiddenInput(),
            "census_blocks_polygon_array": forms.HiddenInput(),
            "census_blocks_polygon": forms.HiddenInput(),
            "block_groups": forms.HiddenInput(),
            "entry_name": forms.TextInput(
                attrs={"placeholder": "Community Name"}
            ),
            "entry_reason": forms.Textarea(attrs={"rows": 3}),
            "cultural_interests": forms.Textarea(attrs={"rows": 3}),
            "economic_interests": forms.Textarea(attrs={"rows": 3}),
            "comm_activities": forms.Textarea(attrs={"rows": 3}),
            "other_considerations": forms.Textarea(attrs={"rows": 3}),
            "user_name": forms.TextInput(attrs={"placeholder": "Full Name"}),
            "user_polygon": forms.HiddenInput(),
        }
        label = {
            "user_name": "Input your full name: ",
            "economic_interests": "Input your community's economic interests: ",
            "cultural_interests": "Input your community's cultural or historical interests: ",
            "comm_activities": "Input your community's activities and services: ",
            "other_considerations": "Input your community's other interests and concerns: ",
            "entry_name": "Input your community's name: "
        }

    def clean(self):
        """
        Make sure that the user polygon contains no kinks and has an acceptable area.
        https://gis.stackexchange.com/questions/288103/how-to-convert-the-area-to-feets-in-geodjango
        Make sure that at least one of the interest fields is filled out.
        """
        errors = {}
        cultural_interests = self.cleaned_data.get("cultural_interests")
        economic_interests = self.cleaned_data.get("economic_interests")
        comm_activities = self.cleaned_data.get("comm_activities")
        other_considerations = self.cleaned_data.get("other_considerations")
        if (
            cultural_interests == ""
            and economic_interests == ""
            and comm_activities == ""
            and other_considerations == ""
        ):
            errors["cultural_interests"] = "Blank interest fields."
        if errors:
            raise forms.ValidationError(errors)


class DeletionForm(ModelForm):
    class Meta:
        model = CommunityEntry
        fields = ["user", "entry_ID"]
        widgets = {
            "user": forms.HiddenInput(),
            "entry_ID": forms.HiddenInput(),
        }


class OrganizationForm(ModelForm):
    class Meta:
        model = Organization
        fields = ["name", "description", "ext_link", "states"]
        labels = {
            "ext_link": "Link to Organization Website",
        }
        widgets = {
            "name": forms.TextInput(
                attrs={"placeholder": "Name of Organization"}
            ),
            "description": forms.Textarea(
                attrs={
                    "placeholder": "Short Description",
                    "rows": 4,
                    "cols": 20,
                }
            ),
            "ext_link": forms.TextInput(
                attrs={
                    "placeholder": "External link to your organization's website. Include 'http'."
                }
            ),
            "states": Select2MultipleWidget(
                choices=STATES, attrs={"data-placeholder": "Select States"},
            ),
        }


#
class AllowlistForm(ModelForm):
    class Meta:
        model = Organization
        fields = ["name"]
        widgets = {
            "name": forms.HiddenInput(),
        }


class DriveForm(ModelForm):
    class Meta:
        model = Drive
        fields = ["name", "description", "state", "require_user_addresses"]
        widgets = {
            "name": forms.TextInput(
                attrs={
                    "placeholder": "Name of Drive",
                    "class": "form-control",
                }
            ),
            "description": forms.Textarea(
                attrs={
                    "placeholder": "Short Description",
                    "class": "form-control",
                }
            ),
            "state": forms.Select(
                choices=STATES, attrs={"class": "form-control"}
            ),
            "require_user_addresses": forms.CheckboxInput(
                attrs={
                    "class": "form-control",
                }
            )
        }


class MemberForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super(MemberForm, self).__init__(*args, **kwargs)
        self.fields["member"].widget.attrs.update({"class": "form-control"})

    class Meta:
        model = Membership
        fields = [
            "member",
        ]

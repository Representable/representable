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
from allauth.account.forms import LoginForm, SignupForm
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
            "street": forms.TextInput(
                attrs={"placeholder": "", "maxlength": 500}
            ),
            "city": forms.TextInput(
                attrs={"placeholder": "", "maxlength": 100}
            ),
            "state": forms.TextInput(
                attrs={"placeholder": "", "maxlength": 100}
            ),
            "zipcode": forms.TextInput(
                attrs={"placeholder": "", "maxlength": 12}
            ),
        }
        labels = {
            "street": "Street: ",
            "city": "City: ",
            "state": "State: ",
            "zipcode": "Zipcode: ",
        }


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
            "population": forms.HiddenInput(),
            "entry_name": forms.TextInput(
                attrs={"placeholder": "ex. University of Texas Students", "maxlength": 100}
            ),
            "entry_reason": forms.Textarea(
                attrs={"rows": 3, "maxlength": 500}
            ),
            "cultural_interests": forms.Textarea(
                attrs={"rows": 3, "maxlength": 500, "placeholder":"ex. My community is made of the Latinx community in east Brooklyn. The community has been in the neighborhood for 20 years and is affected by gentrification."}
            ),
            "economic_interests": forms.Textarea(
                attrs={"rows": 3, "maxlength": 500, "placeholder": "ex. My community is located near a river. Fishing is the main industry. We experience seasonal unemployment. Water pollution of the river is a common concern of ours."}
            ),
            "comm_activities": forms.Textarea(
                attrs={"rows": 3, "maxlength": 500, "placeholder": "ex. My community is made of the people who go to St. Peters Catholic Church. The church provides child care and charity services for the less fortunate in our community. "}
            ),
            "other_considerations": forms.Textarea(
                attrs={"rows": 3, "maxlength": 500, "placeholder": "ex. My farming community extends over two counties and we hope you can put the community together in a single State Senate district."}
            ),
            "user_name": forms.TextInput(
                attrs={"maxlength": 500}
            ),
            "user_polygon": forms.HiddenInput(),
        }
        label = {
            "user_name": "Input your full name: ",
            "economic_interests": "Input your community's economic interests: ",
            "cultural_interests": "Input your community's cultural or historical interests: ",
            "comm_activities": "Input your community's activities and services: ",
            "other_considerations": "Input your community's other interests and concerns: ",
            "entry_name": "Input your community's name: ",
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
            "name": "Organization Name",
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
            "states": forms.Select(
                choices=STATES, attrs={"data-placeholder": "Select States"},
            ),
        }

class EditOrganizationForm(ModelForm):
    class Meta:
        model = Organization
        fields = ["name", "description", "ext_link"]
        labels = {
            "name": "Organization Name",
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
        }

class AllowlistForm(ModelForm):
    class Meta:
        model = Organization
        fields = ["name"]
        widgets = {
            "name": forms.HiddenInput(),
        }


class DriveForm(ModelForm):
    def __init__(self, org_states, *args, **kwargs):
        super(DriveForm, self).__init__(*args, **kwargs)
        choices = [state for state in STATES if state[0] in org_states]
        self.fields["state"].widget = forms.Select(
            choices=choices, attrs={"class": "form-control"}
        )

    class Meta:
        model = Drive
        fields = ["name", "description", "state", "require_user_addresses"]
        labels = {
            "name": "Drive Title",
            "ext_link": "Link to Organization Website",
        }
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
                attrs={"class": "form-check-input"}
            ),
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


class RepresentableSignupForm(SignupForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for _, field in self.fields.items():
            del field.widget.attrs["placeholder"]


class RepresentableLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for _, field in self.fields.items():
            del field.widget.attrs["placeholder"]
        self.fields["login"].label = "E-mail"
        del self.fields["login"].widget.attrs["autofocus"]

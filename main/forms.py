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
from .models import (
    CommunityEntry,
    Organization,
    Drive,
    Membership,
    User,
    Address,
    State,
)
from .choices import STATES, UNITS
from django.contrib.gis.db import models
from django.contrib.gis.measure import Area
from django.core.files.images import get_image_dimensions

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
            "census_blocks": forms.HiddenInput(),
            "population": forms.HiddenInput(),
            "entry_name": forms.Textarea(
                attrs={
                    "placeholder": "ex. University of Texas Students",
                    "maxlength": 100,
                    "rows": 1,
                }
            ),
            "entry_reason": forms.Textarea(
                attrs={"rows": 3, "maxlength": 500}
            ),
            "cultural_interests": forms.Textarea(
                attrs={
                    "rows": 3,
                    "maxlength": 700,
                    "placeholder": "ex. My community is made of the Latinx community in east Brooklyn. The community has been in the neighborhood for 20 years and is affected by gentrification.",
                }
            ),
            "economic_interests": forms.Textarea(
                attrs={
                    "rows": 3,
                    "maxlength": 700,
                    "placeholder": "ex. My community is located near a river. Fishing is the main industry. We experience seasonal unemployment. Water pollution of the river is a common concern of ours.",
                }
            ),
            "comm_activities": forms.Textarea(
                attrs={
                    "rows": 3,
                    "maxlength": 700,
                    "placeholder": "ex. My community is made of the people who go to St. Peters Catholic Church. The church provides child care and charity services for the less fortunate in our community. ",
                }
            ),
            "other_considerations": forms.Textarea(
                attrs={
                    "rows": 3,
                    "maxlength": 700,
                    "placeholder": "ex. My farming community extends over two counties and we hope you can put the community together in a single State Senate district.",
                }
            ),
            "custom_response": forms.Textarea(
                attrs={"rows": 3, "maxlength": 700, "placeholder": ""}
            ),
            "tags": forms.TextInput(),
            "user_name": forms.TextInput(attrs={"maxlength": 500}),
            "user_polygon": forms.HiddenInput(),
        }
        label = {
            "user_name": "Input your full name: ",
            "economic_interests": "Input your community's economic interests: ",
            "cultural_interests": "Input your community's cultural or historical interests: ",
            "comm_activities": "Input your community's activities and services: ",
            "other_considerations": "Input your community's other interests and concerns: ",
            "custom_response": "Input your response to this mapping drive's custom question: ",
            "tags": "Input a comma-separated list of tags for your community: ",
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
        custom_response = self.cleaned_data.get("custom_response")
        if (
            cultural_interests == ""
            and economic_interests == ""
            and comm_activities == ""
            and other_considerations == ""
            and custom_response == ""
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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.label_suffix = ""

    class Meta:
        model = Organization
        fields = ["name", "description", "ext_link", "states", "government", "logo"]
        labels = {
            "name": "Organization name*",
            "ext_link": "Link to organization website",
            "logo": "Optional organization logo",
            "government": "Are you a state or city government?",
        }
        widgets = {
            "name": forms.TextInput(
                attrs={"placeholder": "Name of organization"}
            ),
            "description": forms.Textarea(
                attrs={
                    "placeholder": "ex. Our goal is to support and uplift Latinx communities in Philadelphia. Our organization is working to ensure that fair maps are drawn in order to protect our communities and have elected officials that reflect our values.",
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
                choices=STATES,
                attrs={"data-placeholder": "Select States"},
            ),
            "government": forms.CheckboxInput(
                attrs={
                    "class": "form-check-input",
                }
            ),
        }

    def clean(self):
        """
        Make sure that the image is a reasonable shape
        """
        errors = {}
        image = self.cleaned_data.get("logo")
        # w = image.width
        # h = image.height
        w = 1
        h = 1
        if image:
            w, h = get_image_dimensions(image)
        r = w/h
        if (
            .5 > r or r > 2
        ):
            errors["logo"] = "Unacceptable image shape. Image should have similar width and height."
        if errors:
            raise forms.ValidationError(errors)


class EditOrganizationForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.label_suffix = ""

    class Meta:
        model = Organization
        fields = ["name", "description", "ext_link", "logo"]
        labels = {
            "name": "Organization name",
            "ext_link": "Link to organization website",
            "logo": "Optional organization logo",
        }
        widgets = {
            "name": forms.TextInput(
                attrs={"placeholder": "Name of organization"}
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

    def clean(self):
        """
        Make sure that the image is a reasonable shape
        """
        errors = {}
        image = self.cleaned_data.get("logo")
        # w = image.width
        # h = image.height
        w = 1
        h = 1
        if image:
            w, h = get_image_dimensions(image)
        r = w/h
        if (
            .5 > r or r > 2
        ):
            errors["logo"] = "Unacceptable image shape. Image should have similar width and height."
        if errors:
            raise forms.ValidationError(errors)


class AllowlistForm(ModelForm):
    class Meta:
        model = Drive
        fields = ["slug"]
        widgets = {
            "slug": forms.HiddenInput(),
        }


class DriveForm(ModelForm):
    def __init__(self, org_states, gov, *args, **kwargs):
        super(DriveForm, self).__init__(*args, **kwargs)
        choices = [state for state in STATES if state[0] in org_states]
        self.fields["state"].widget = forms.Select(
            choices=choices, attrs={"class": "form-control"}
        )
        optional_fields = [
            "opt_redist_title",
            "opt_redist_info",
            "opt_criteria_title",
            "opt_criteria_info",
            "opt_coi_def_title",
            "opt_coi_def_info",
        ]
        self.label_suffix = ""
        if not gov:
            self.auto_id = False
            for f in optional_fields:
                self.fields[f].widget = forms.HiddenInput()
                self.fields[f].label = ''
        # for f in optional_fields:
        #     self.fields[f].widget = forms.HiddenInput()
        #     self.fields[f].label = ''
        # for f in optional_fields:
            # self.fields[f].label_suffix = "_opt"

    class Meta:
        model = Drive
        fields = [
            "name",
            "state",
            "require_user_addresses",
            "description",
            "units",
            "opt_redist_title",
            "opt_redist_info",
            "opt_criteria_title",
            "opt_criteria_info",
            "opt_coi_def_title",
            "opt_coi_def_info",
        ]
        labels = {
            "name": "Drive Title*",
            "units": "Default mapping units*",
            "description": "Description*",
            "state": "State*",
            "require_user_addresses": "Require user addresses",
            "opt_redist_title": "Redistricting title",
            "opt_redist_info": "Redistricting information",
            "opt_criteria_title": "Criteria title",
            "opt_criteria_info": "Criteria information",
            "opt_coi_def_title": "COI definition title",
            "opt_coi_def_info": "COI definition information",
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
                    "placeholder": "ex. This is a drive run by [organization name] to collect communities of interest.",
                    "class": "form-control",
                }
            ),
            "state": forms.Select(
                choices=STATES, attrs={"class": "form-control"}
            ),
            "require_user_addresses": forms.CheckboxInput(
                attrs={"class": "form-check-input"}
            ),
            "opt_redist_title": forms.TextInput(
                attrs={
                    "placeholder": "ex. Redistricting in [State/City]",
                    "class": "form-control",
                }
            ),
            "opt_redist_info": forms.Textarea(
                attrs={
                    "placeholder": "ex. Description of how redistricting works in your state or city.",
                    "class": "form-control",
                }
            ),
            "opt_criteria_title": forms.TextInput(
                attrs={
                    "placeholder": "ex. [State/City] Redistricting Criteria",
                    "class": "form-control",
                }
            ),
            "opt_criteria_info": forms.Textarea(
                attrs={
                    "placeholder": "ex. A list of redistricting criteria in your state or city.",
                    "class": "form-control",
                }
            ),
            "opt_coi_def_title": forms.TextInput(
                attrs={
                    "placeholder": "ex. Communities of Interest in [State/City]",
                    "class": "form-control",
                }
            ),
            "opt_coi_def_info": forms.Textarea(
                attrs={
                    "placeholder": "ex. The definition of Communities of Interest in your state or city.",
                    "class": "form-control",
                }
            ),
            "units": forms.Select(
                choices=UNITS, attrs={"class": "form-control"}
            ),
        }

    def clean(self):
        """
        Make sure all of the optional fields have information filled out
        """
        errors = {}
        a1 = self.cleaned_data.get("opt_redist_title")
        a2 = self.cleaned_data.get("opt_redist_info")
        b1 = self.cleaned_data.get("opt_criteria_title")
        b2 = self.cleaned_data.get("opt_criteria_info")
        c1 = self.cleaned_data.get("opt_coi_def_title")
        c2 = self.cleaned_data.get("opt_coi_def_info")
        if ((a1 or a2 or b1 or b2 or c1 or c2) and not (a1 and a2 and b1 and b2 and c1 and c2)
        ):
            errors["opt_redist_title"] = "You must fill out none or all of the customized criteria."
        if errors:
            raise forms.ValidationError(errors)


class MemberForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super(MemberForm, self).__init__(*args, **kwargs)
        member_email = forms.EmailField(max_length=200)
        self.fields["email"] = member_email
        self.fields["email"].widget.attrs.update(
            {"placeholder": "Admin Email", "class": "form-control"}
        )

    class Meta:
        model = Membership
        fields = [
            "member",
        ]
        exclude = ("member",)


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
        self.fields["password"].label = "Password"
        if "autofocus" in self.fields["login"].widget.attrs:
            del self.fields["login"].widget.attrs["autofocus"]


class SubmissionAddDrive(forms.Form):
    def upd(self, state):
        """
        Req: state must be a valid, uppercased, state abbreviation

        Creates a dropdown of drives that satisfy the rules:
            * Are in state
            * Are active
            * Are not private
        """
        all_drives = State.objects.get(abbr=state).get_drives()
        drives_to_add = [
            d
            for d in all_drives
            if d.state == state
            and d.is_active
            and not d.private  # changed this line
        ]
        choices = [
            (str(d.id), str(d.name) + " - " + str(d.organization))
            for d in drives_to_add
        ]
        self.fields["Add a new drive"] = forms.ChoiceField(
            choices=choices,
            widget=forms.Select(attrs={"class": "custom-select"}),
        )

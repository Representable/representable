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
    ModelSelect2TagWidget,
)
from .models import (
    CommunityEntry,
    Tag,
    Organization,
    Campaign,
    Membership,
    User,
    Address,
)
from .choices import (
    RACE_CHOICES,
    RELIGION_CHOICES,
    INDUSTRY_CHOICES,
    STATES,
)
from django.contrib.gis.db import models
from django.contrib.gis.measure import Area

from phone_field import PhoneField

# https://django-select2.readthedocs.io/en/latest/django_select2.html


class TagSelect2Widget(ModelSelect2TagWidget):
    model = Tag
    search_fields = ["name__icontains"]
    queryset = model.objects.all()
    # Check if tag name is in the db already. If not, add it.

    def value_from_datadict(self, data, files, name):
        values = super().value_from_datadict(data, files, name)
        cleaned_values = []
        names = []
        for val in values:
            # Do any names in the db match this value?
            qs = self.queryset.filter(**{"name__exact": str(val)})
            # Add the names to 'names'
            newNames = set(getattr(entry, "name") for entry in qs)
            for name in newNames:
                names.append(str(name))

        for val in values:
            if str(val) not in names:
                val = self.queryset.create(name=str(val)).name
            cleaned_values.append(str(val))
        return cleaned_values


class BootstrapRadioSelect(forms.RadioSelect):
    template_name = "forms/widgets/radio.html"
    option_template_name = "forms/widgets/radio_option.html"


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
        census_blocks_polygon_array = models.PolygonField(
            error_messages={"required": "Census blocks array missing."}
        )
        census_blocks_polygon = models.PolygonField(
            error_messages={"required": "Census blocks polygon missing."}
        )
        widgets = {
            "tags": TagSelect2Widget(
                attrs={
                    "data-placeholder": "E.g. FlintWaterCrisis, KoreaTown, etc."
                }
            ),
            "user": forms.HiddenInput(),
            "entry_ID": forms.HiddenInput(),
            "census_blocks_polygon_array": forms.HiddenInput(),
            "census_blocks_polygon": forms.HiddenInput(),
            "entry_name": forms.TextInput(
                attrs={"placeholder": "My local community..."}
            ),
            "entry_reason": forms.Textarea(
                attrs={
                    "placeholder": "Example: This community is brought together by ... and we'd like the commission to\
                                    keep us in the same district so we can be represented by one person",
                    "rows": 5,
                }
            ),
            "cultural_interests": forms.Textarea(
                attrs={
                    "placeholder": "Examples: Age groups, religious groups,"
                    " arts and cultural centers, languages, immigration status, "
                    "ethnic groups such as Detroit’s Mexican Town or "
                    "Dearborn’s Middle Eastern community, historic settlements "
                    "such as Leland’s Fishtown.",
                    "rows": 5,
                }
            ),
            "economic_interests": forms.Textarea(
                attrs={
                    "placeholder": "Examples: Tech firms and their employees, tourism, "
                    "agriculture such as the cherry growers, shipping and "
                    "transportation hubs, manufacturing centers, natural resources, "
                    "university towns, unemployment issues, waterfront "
                    "communities, business associations.",
                    "rows": 5,
                }
            ),
            "comm_activities": forms.Textarea(
                attrs={
                    "placeholder": "Examples: Shopping areas, schools and colleges, parks "
                    "and recreation areas, lakes and water ways, healthcare services, "
                    "and other activities and services that help define "
                    "your Community.",
                    "rows": 5,
                }
            ),
            "other_considerations": forms.Textarea(
                attrs={
                    "placeholder": "Include any other considerations that are not reflected in the questions above.",
                    "rows": 5,
                }
            ),
            "user_name": forms.TextInput(attrs={"placeholder": "User Name"}),
            "user_phone": PhoneField,
            "user_polygon": forms.HiddenInput(),
        }
        labels = {
            "tags": "Community Tags",
            "race": "List Racial Groups (At Least One, Multiple Accepted)",
            "industry": "List Industries/Profressions (At Least One, Multiple Accepted)",
            "religion": "List Religions (At Least One, Multiple Accepted)",
        }

    def clean(self):
        """
        Make sure that the user polygon contains no kinks and has an acceptable area.
        https://gis.stackexchange.com/questions/288103/how-to-convert-the-area-to-feets-in-geodjango
        Make sure that at least one of the interest fields is filled out.
        Check if the phone number is a valid US number.
        """
        errors = {}
        # check if the user drew a polygon
        if "user_polygon" not in self.cleaned_data:
            errors["user_polygon"] = "Polygon doesn't exist"
        else:
            data = self.cleaned_data["user_polygon"]
            # Check kinks in the polygon
            if not data.valid:
                errors["user_polygon"] = "Polygon contains kinks."
        phone = self.cleaned_data.get("user_phone")
        cultural_interests = self.cleaned_data.get("cultural_interests")
        economic_interests = self.cleaned_data.get("economic_interests")
        comm_activities = self.cleaned_data.get("comm_activities")
        other_considerations = self.cleaned_data.get("other_considerations")
        if not phone.is_usa:
            errors["user_phone"] = "Invalid phone number."
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
            "ext_link": "Link to Organization",
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
                    "placeholder": "External link to your organization. Include 'http'."
                }
            ),
            "states": Select2MultipleWidget(
                choices=STATES, attrs={"data-placeholder": "Select States"},
            ),
        }


#
class WhitelistForm(ModelForm):
    class Meta:
        model = Organization
        fields = ["name"]
        widgets = {
            "name": forms.HiddenInput(),
        }


class CampaignForm(ModelForm):
    class Meta:
        model = Campaign
        fields = ["name", "description", "state", "is_active"]
        widgets = {
            "name": forms.TextInput(attrs={"placeholder": "Name of Campaign"}),
            "description": forms.Textarea(
                attrs={"placeholder": "Short Description"}
            ),
            "state": forms.Select(
                choices=STATES, attrs={"class": "form-control"}
            ),
        }
        labels = {"is_active": "Campaign is accepting submissions"}


class MemberForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super(MemberForm, self).__init__(*args, **kwargs)
        self.fields["member"].widget.attrs.update({"class": "form-control"})
        self.fields["is_org_moderator"].widget.attrs.update(
            {"class": "form-control"}
        )
        self.fields["is_org_admin"].widget.attrs.update(
            {"class": "form-control"}
        )

    class Meta:
        model = Membership
        fields = [
            "member",
            "is_org_admin",
            "is_org_moderator",
        ]

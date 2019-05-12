from django import forms
from django.forms import ModelForm
from django_select2.forms import Select2MultipleWidget, Select2Widget, ModelSelect2Widget,ModelSelect2TagWidget,ModelSelect2Widget
from .models import CommunityEntry, Issue, Tag
from django.forms import formset_factory
from .choices import *
from django.forms.formsets import BaseFormSet
from django.contrib.gis.db import models
from django.contrib.gis.measure import Area

# https://django-select2.readthedocs.io/en/latest/django_select2.html

# def get_miles(self):
#     '''
#     Function used to project geometry in order to get area.
#     From: https://gis.stackexchange.com/questions/9673/area-units-for-geos-area-property
#     '''
#     # convert polygon to SRID 4326
#     self.polygon.transform(4326)
#     meters_sq = self.polygon.area.sq_m
#     print(meters_sq)
#     return meters_sq


class TagSelect2Widget(ModelSelect2TagWidget):
    model = Tag
    search_fields=['name__icontains']
    queryset = model.objects.all()
    # Check if tag name is in the db already. If not, add it.
    def value_from_datadict(self, data, files, name):
        values = super().value_from_datadict(data, files, name)
        print(values)
        cleaned_values = []
        names = []
        for val in values:
            # Do any names in the db match this value?
            qs = self.queryset.filter(**{'name__exact':str(val)})
            # Add the names to 'names'
            newNames = set(getattr(entry, 'name') for entry in qs)
            for name in newNames:
                names.append(str(name))

        for val in values:
            if str(val) not in names:
                print("Create ENTRY")
                print(str(val))
                val = self.queryset.create(name=str(val)).name
            print(names)
            cleaned_values.append(str(val))
        return cleaned_values

        # print(values)
        # for val in values:
        #     # Do any names in the db match this value?
        #     qs = self.queryset.filter(**{'name__exact':str(val)})
        #     # Add the names to 'names'
        #     newNames = set(getattr(entry, 'name') for entry in qs)
        #     for name in newNames:
        #         names.append(str(name))
        #     if val.isnumeric():
        #         print("Int detected.")
        #         qs = self.queryset.filter(**{'id__exact':int(val)})
        #         newIds = set(getattr(entry, 'id') for entry in qs)
        #         for id in newIds:
        #             ids.append(int(id))
        #
        # print(names)
        # print(ids)
        # for val in values:
        #     if val.isnumeric():
        #         if int(val) not in ids and str(val) not in names:
        #             print("Created")
        #             val = self.queryset.create(name=str(val)).id
        #     else:
        #         if str(val) not in names:
        #             val = self.queryset.create(name=str(val)).id
        #     print(str(val))
        #     cleaned_values.append(str(val))
        # return cleaned_values

class IssueForm(ModelForm):
    class Meta:
        model = Issue
        fields = '__all__'
        exclude = ("entry",)

        widgets = {
            'category': forms.Select(choices = POLICY_ISSUES, attrs={'class': 'form-control'}),
            'description': forms.TextInput(attrs={'placeholder': 'Short Description'})
        }

    def clean(self):
        """
        Adds validation to check that all issues have
        both a description and a category.
        Courtesy of: https://whoisnicoleharris.com/2015/01/06/implementing-django-formsets.html
        """
        data = self.cleaned_data
        category = self.cleaned_data['category']
        description = self.cleaned_data['description']
        # Check that issues have both a category and a description
        if description and not category:
            msg = "Category Missing"
            self.add_error('category', msg)
            raise forms.ValidationError(
                'All issues must have a category.',
                code='missing_category'
            )
        elif category and not description:
            msg = "Description Missing"
            self.add_error('description', msg)
            raise forms.ValidationError(
                'All issues must have a description.',
                code='missing_description'
            )
        return data

class BootstrapRadioSelect(forms.RadioSelect):
    template_name = 'forms/widgets/radio.html'
    option_template_name = 'forms/widgets/radio_option.html'

class CommunityForm(ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['census_blocks_polygon_array'].delimiter = '|'

    class Meta:
        model = CommunityEntry
        fields = '__all__'
        user_polygon = models.PolygonField(error_messages={'required':'User polygon missing. Please draw your community.'})
        widgets = {
            'race': Select2MultipleWidget(choices=RACE_CHOICES, attrs={'data-placeholder': 'E.g. Black, Asian, etc.'}),
            'religion': Select2MultipleWidget(choices=RELIGION_CHOICES, attrs={'data-placeholder': 'E.g. Christian, Hindu etc.'}),
            'industry': Select2MultipleWidget(choices=INDUSTRY_CHOICES, attrs={'data-placeholder': 'E.g. Fishing, Professional etc.'}),
            'entry_issues': ModelSelect2TagWidget(model=Issue,queryset = Issue.objects.all(),search_fields=['name__icontains']),
            'tags': TagSelect2Widget(attrs={'data-placeholder': 'E.g. FlintWaterCrisis, KoreaTown, etc.'}),
            'user': forms.HiddenInput(),
            'entry_ID': forms.HiddenInput(),
            'census_blocks_polygon_array': forms.HiddenInput(),
            'census_blocks_polygon': forms.HiddenInput(),
            'user_polygon': forms.HiddenInput(),
            'my_community': BootstrapRadioSelect(),
            'zipcode': forms.TextInput(attrs={'placeholder': 'Your Zipcode'})
        }
        labels = {
            "tags": "Community Tags",
            'race': 'List Racial Groups (At Least One, Multiple Accepted)',
            'industry': 'List Industries/Profressions (At Least One, Multiple Accepted)',
            'religion': 'List Religions (At Least One, Multiple Accepted)'
        }

    def clean_user_polygon(self):
        '''
        Make sure that the user polygon contains no kinks and has an acceptable area.
        https://gis.stackexchange.com/questions/288103/how-to-convert-the-area-to-feets-in-geodjango
        '''

        data = self.cleaned_data['user_polygon']
        # Check kinks
        if not data.valid:
            raise ValidationError("Polygon contains kinks.")
        # Check area
        polygon = data.transform(3857, clone=True)
        area = Area(sq_m=polygon.area)
        # Use NJ State Area * 1/2
        halfStateArea = 4350;
        if area.sq_mi > halfStateArea:
            raise ValidationError("Area is too big.")
        return data

class DeletionForm(ModelForm):
    class Meta:
        model = CommunityEntry
        fields = ['user', 'entry_ID']
        widgets = {
            'user': forms.HiddenInput(),
            'entry_ID': forms.HiddenInput(),
        }

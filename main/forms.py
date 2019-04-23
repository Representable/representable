from django import forms
from django.forms import ModelForm
from django_select2.forms import Select2MultipleWidget, Select2Widget, ModelSelect2Widget,ModelSelect2TagWidget
from .models import CommunityEntry, Issue, Tag
from django.forms import formset_factory
from .choices import *
from django.forms.formsets import BaseFormSet

# https://django-select2.readthedocs.io/en/latest/django_select2.html

class TagSelect2Widget(ModelSelect2TagWidget):
    model = Tag
    search_fields=['name__icontains']
    queryset = model.objects.all()

    def value_from_datadict(self, data, files, name):
        values = super().value_from_datadict(data, files, name)
        queryset = self.get_queryset()
        pks = queryset.filter(**{'name__in': list(values)}).values_list('name', flat=True)
        cleaned_values = []
        for val in values:
            if str(val) not in pks:
                val = queryset.create(name=val).pk
            cleaned_values.append(val)
        return cleaned_values

class IssueForm(ModelForm):
    class Meta:
        model = Issue
        fields = '__all__'

        widgets = {
            'category': Select2Widget(choices = POLICY_ISSUES), # attrs={'data-token-separators': "[',']"}
        }

class BootstrapRadioSelect(forms.RadioSelect):
    template_name = 'forms/widgets/radio.html'
    option_template_name = 'forms/widgets/radio_option.html'

class CommunityForm(ModelForm):
    class Meta:
        model = CommunityEntry
        fields = '__all__'

        widgets = {
            'race': Select2MultipleWidget(choices=RACE_CHOICES),
            'religion': Select2MultipleWidget(choices=RELIGION_CHOICES),
            'industry': Select2MultipleWidget(choices=INDUSTRY_CHOICES),
            'entry_issues': ModelSelect2TagWidget(model=Issue,queryset = Issue.objects.all(),search_fields=['name__icontains']),
            'tags': TagSelect2Widget(),
            'user': forms.HiddenInput(),
            'entry_ID': forms.HiddenInput(),
            'entry_polygon': forms.HiddenInput(),
            'my_community': BootstrapRadioSelect(),
        }

class BaseIssueFormSet(BaseFormSet):
    def clean(self):
        """
        https://whoisnicoleharris.com/2015/01/06/implementing-django-formsets.html
        Adds validation to check that no two issues have the same category and that
        all links have both a category and description.
        """
        if any(self.errors):
            return

        categories = []
        descriptions = []
        duplicates = False

        for form in self.forms:
            if form.cleaned_data:
                category = form.cleaned_data['category']
                description = form.cleaned_data['description']

                # Check that all links have both a category and a description
                if category and not description:
                    raise forms.ValidationError(
                        'All issues must have a category.',
                        code='missing_category'
                    )
                elif anchor and not url:
                    raise forms.ValidationError(
                        'All issues must have a description.',
                        code='missing_description'
                    )

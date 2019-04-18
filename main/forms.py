from django import forms
from django.forms import ModelForm
from django_select2.forms import Select2MultipleWidget, Select2Widget, ModelSelect2Widget,Select2TagWidget
from .models import CommunityEntry, Issue
from django.forms import formset_factory
from .choices import *

# https://django-select2.readthedocs.io/en/latest/django_select2.html

class IssueSelect2Widget(ModelSelect2Widget):
    model = Issue
    choices = POLICY_ISSUES
    search_fields=['category__icontains']

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
            #'entry_issues': ModelSelect2TagWidget(model=Issue,queryset = Issue.objects.all(),search_fields=['name__icontains']),
            'entry_issues': IssueSelect2Widget(),
            'user': forms.HiddenInput(),
            'entry_ID': forms.HiddenInput(),
            'entry_polygon': forms.HiddenInput(),
            'zipcode': forms.HiddenInput(),
            'my_community': BootstrapRadioSelect(),

        }

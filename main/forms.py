from django import forms
from django.forms import ModelForm
from django_select2.forms import Select2MultipleWidget, Select2Widget, ModelSelect2Widget,Select2TagWidget
from .models import CommunityEntry, Issue, RACE_CHOICES, POLICY_ISSUES
from django.forms import formset_factory

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




class CommunityForm(ModelForm):
    class Meta:
        model = CommunityEntry
        fields = '__all__'

        widgets = {
            'race': Select2MultipleWidget(choices=RACE_CHOICES),
            #'entry_issues': ModelSelect2TagWidget(model=Issue,queryset = Issue.objects.all(),search_fields=['name__icontains']),
            'entry_issues': IssueSelect2Widget(),
            'user': forms.HiddenInput(),
            'entry_ID': forms.HiddenInput(),
            'entry_polygon': forms.HiddenInput()
        }

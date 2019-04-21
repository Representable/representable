from django import forms
from django.forms import ModelForm
from django_select2.forms import Select2MultipleWidget, Select2Widget, ModelSelect2Widget,ModelSelect2TagWidget
from .models import CommunityEntry, Issue, Tag
from django.forms import formset_factory
from .choices import *

# https://django-select2.readthedocs.io/en/latest/django_select2.html

class TagSelect2Widget(ModelSelect2TagWidget):
    model = Tag
    search_fields=['name__icontains']

    # def create_value(self, value):
    #     print("theodor")
    #     print(value)
    #     self.get_queryset().create(name=value)
    # def value_from_datadict(self, data, files, name):
    #     values = super(TagSelect2Widget, self).value_from_datadict(self, data, files, name)
    #     qs = self.queryset.filter(**{'pk__in': list(values)})
    #     pks = set(str(getattr(o, pk)) for o in qs)
    #     cleaned_values = []
    #     for val in values:
    #         if str(val) not in pks:
    #             val = queryset.create(name=val).pk
    #         cleaned_values.append(val)
    #     return cleaned_values
    '''
    def value_from_datadict(self, data, files, name):
        values = super(TagSelect2Widget, self).value_from_datadict(data, files, name)
        return ",".join(values)

    def optgroups(self, name, value, attrs=None):
        values = value[0].split(',') if value[0] else []
        selected = set(values)
        subgroup = [self.create_option(name, v, v, selected, i) for i, v in enumerate(values)]
        return [(None, subgroup, 0)]
    '''

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
            'tags': TagSelect2Widget(),
            'user': forms.HiddenInput(),
            'entry_ID': forms.HiddenInput(),
            'entry_polygon': forms.HiddenInput(),
            'zipcode': forms.HiddenInput(),
            'my_community': BootstrapRadioSelect(),

        }

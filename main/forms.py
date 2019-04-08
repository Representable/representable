from django import forms
from django.forms import ModelForm
from django_select2.forms import Select2MultipleWidget, Select2Widget
from .models import Community, RACE_CHOICES

class CommunityForm(ModelForm):
    class Meta:
        model = Community
        fields = '__all__'

        widgets = {
            'race': Select2MultipleWidget(choices=RACE_CHOICES)
        }

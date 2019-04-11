from django import forms
from django.forms import ModelForm
from django_select2.forms import Select2MultipleWidget, Select2Widget
from .models import CommunityEntry, RACE_CHOICES

class CommunityForm(ModelForm):
    class Meta:
        model = CommunityEntry
        fields = '__all__'

        widgets = {
            'race': Select2MultipleWidget(choices=RACE_CHOICES),
            'user': forms.HiddenInput(),
            'entry_ID': forms.HiddenInput(),
            'entry_location': forms.HiddenInput(),
            'entry_polygon': forms.HiddenInput()
        }

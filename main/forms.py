from django import forms
from django.forms import ModelForm
from django_select2.forms import Select2MultipleWidget, Select2Widget, ModelSelect2TagWidget
from .models import Community, RACE_CHOICES

# https://django-select2.readthedocs.io/en/latest/django_select2.html
class IssueSelect2TagWidget(ModelSelect2TagWidget):
    model = Community
    search_fields=['issues__icontains','pk__startswith']
    #queryset = Community.objects.all().values_list('issues', flat=True)
    def create_value(self, value):
        for v in value:
            self.get_query_set().create(title=v)

class CommunityForm(ModelForm):
    class Meta:
        model = Community
        fields = '__all__'

        widgets = {
            'race': Select2MultipleWidget(choices=RACE_CHOICES),
            'issues': IssueSelect2TagWidget(attrs={'data-token-separators': "[',']"}),
            #model = Community,
            #https://stackoverflow.com/questions/952914/how-to-make-a-flat-list-out-of-list-of-lists
            #queryset= Community.objects.all().values_list('issues', flat=True),
            #attrs={'data-token-separators': "[',']"},
            #search_fields=['issues__icontains'],)
        }

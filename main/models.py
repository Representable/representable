from django.contrib.gis.db import models
from django.forms import ModelForm
from django import forms
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django_select2.forms import Select2MultipleWidget, Select2Widget
# Geo App
import uuid

# Referenced https://docs.djangoproject.com/en/2.2/topics/forms/modelforms/#a-full-example
'''
- zipcode
-state
- race
- many people in this community are immigrants
- issues our community cares about
- This is my community / I am creating this on behalf of another community
'''
# https://www.census.gov/topics/population/race/about.html
RACE_CHOICES = (
    ('white', 'White'),
    ('black', 'Black or African American'),
    ('native', 'American Indian or Alaska Native'),
    ('pacific_islander', 'Native Hawaiian or Other Pacific Islander'),
    ('Asian', (
        ('indian', 'Asian Indian'),
        ('chinese', 'Chinese'),
        ('filipino', 'Filipino'),
        ('japanese', 'Japanese'),
        ('korean', 'Korean'),
        ('vietnamese', 'Vietnamese'),
        ('other_asian', 'Other Asian'),
        )
    ),
    ('other', 'Other'),
)

class Community(models.Model):
    zipcode = models.CharField(max_length=5)
    race = ArrayField(models.CharField(max_length=50,choices=RACE_CHOICES),default=list,blank=False)
    #race = models.ManyToManyField(Race)
    issues =  models.CharField(max_length=100)
    is_my_community = models.BooleanField()
    creator =  models.ForeignKey(User, on_delete=models.CASCADE)

class CommunityForm(ModelForm):
    class Meta:
        model = Community
        fields = '__all__'

        widgets = {
            'race': Select2MultipleWidget(choices=RACE_CHOICES)
        }


class Entry(models.Model):
    # Max Length = 100 chars, Blank=False - Field cannot be false. Unique - field has to be unique.
    entry_ID = models.CharField(max_length=100, blank=False, unique=True, default=uuid.uuid4)
    # Store the location searched by the user (lat-long)
    entry_location = models.PointField()
    # Store the polygon created by the user.
    entry_polygon = models.PolygonField()
    def __str__(self):
        return self.entry_ID

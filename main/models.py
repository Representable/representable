from django.contrib.postgres.fields import ArrayField
# Geo App
import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import migrations, models
from django.contrib.gis.db import models
from .choices import *

#******************************************************************************#

class User(AbstractUser):
    pass

#******************************************************************************#

class Tag(models.Model):
    '''
    Referenced https://docs.djangoproject.com/en/2.2/topics/forms/modelforms/#a-full-example
    The tag table stores tags associated with different entries.
    '''
    name = models.CharField(max_length=100, primary_key=True)

    class Meta:
        ordering = ('name',)
    def __str__(self):
        return self.name

#******************************************************************************#

class CommunityEntry(models.Model):
    '''
    Community Entry represents the entry created by the user when drawing their
    COI.
    '''
    # https://www.census.gov/topics/population/race/about.html
    # Foreign Key = User (Many to One)
    # https://docs.djangoproject.com/en/2.2/topics/db/examples/many_to_one/
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # Generated randomly every time.
    entry_ID = models.CharField(max_length=100, blank=False, unique=True, default=uuid.uuid4)
    # From Mapbox GL GS.
    entry_polygon = models.PolygonField(serialize=True)
    # "Which races shape this community's identity? Select one or multiple."
    race = ArrayField(models.CharField(max_length=50,choices=RACE_CHOICES),default=list,blank=True)
    religion = ArrayField(models.CharField(max_length=50,choices=RELIGION_CHOICES),default=list,blank=True)
    industry = ArrayField(models.CharField(max_length=50,choices=INDUSTRY_CHOICES),default=list,blank=True)
    # User Zipcode
    zipcode = models.CharField(max_length=5, blank=False, null=False)
    tags = models.ManyToManyField(Tag)

    CHOICES=(
        ('Y','Yes, this is my community.'),
        ('N','No, I am creating this community on behalf of another group of people.')
    )
    my_community = models.CharField("Is this your community?", max_length=1,choices=CHOICES, default= 'Y', blank=False, null=False)


    def __str__(self):
        return str(self.entry_ID)
    class Meta:
        db_table = "community_entry"

#******************************************************************************#

class Issue(models.Model):
    '''
    Issue holds issues associated with each community entry.
    '''
    entry = models.ForeignKey(CommunityEntry, on_delete=models.CASCADE, default=None, blank=False)
    category = models.CharField(max_length=50, choices=POLICY_ISSUES, default=None)
    description = models.CharField(max_length=250)

    class Meta:
        ordering = ('category','description',)

    def __str__(self):
        return self.description

#******************************************************************************#

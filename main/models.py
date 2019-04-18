from django.contrib.postgres.fields import ArrayField
# Geo App
import uuid
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import migrations, models
from django.contrib.gis.db import models

class User(AbstractUser):
    pass

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

POLICY_ISSUES = (
    ('criminal_justice', 'Criminal Justice'),
    ('civil_rights','Civil Rights'),
    ('economic','Economic Affairs'),
    ('education','Education'),
    ('environment','Environment'),
    ('health','Health and Health Insurance'),
    ('internet','Internet Regulation'),
    ('women','Women\'s Issues'),
    ('lgbt', 'LGBT Issues'),
    ('security','National Security'),
    ('welfare', 'Social Welfare')
)
class Issue(models.Model):
    category = models.CharField(max_length=50,choices=POLICY_ISSUES,default=None)
    description = models.CharField(max_length=250)

    class Meta:
        ordering = ('category','description',)

    def __str__(self):
        return self.description

'''
class Community(models.Model):
    zipcode = models.CharField(max_length=5)
    race = ArrayField(models.CharField(max_length=50,choices=RACE_CHOICES),default=list,blank=False)
    issues =  ArrayField(models.CharField(max_length=100),default=list,blank=False)
    is_my_community = models.BooleanField()
'''
class CommunityEntry(models.Model):
    # Foreign Key = User (Many to One)
    # https://docs.djangoproject.com/en/2.2/topics/db/examples/many_to_one/
    user =  models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # Max Length = 100 chars, Blank=False - Field cannot be blank. Unique - field has to be unique.
    entry_ID = models.CharField(max_length=100, blank=False, unique=True, default=uuid.uuid4)
    # Store the location searched by the user (lat-long)
    # entry_location = models.PointField()
    # Store the polygon created by the user.
    entry_polygon = models.PolygonField(serialize=True)
    # Zipcode
    zipcode = models.CharField(max_length=5)
    # Race
    race = ArrayField(models.CharField(max_length=50,choices=RACE_CHOICES),default=list,blank=False)
    # Issues
    #issues = models.ManyToManyField(Issue,related_name='new_issues')
    #issue_list = models.ManyToManyField(Issue,related_name='old_issues')
    entry_issues = models.ManyToManyField(Issue)
    # My Community
    is_my_community = models.BooleanField()

    def __str__(self):
        return str(self.entry_ID)
    class Meta:
        db_table = "community_entry"

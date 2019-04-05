from django.contrib.gis.db import models
import uuid

class Entry(models.Model):
    # Max Length = 100 chars, Blank=False - Field cannot be false. Unique - field has to be unique.
    entry_ID = models.CharField(max_length=100, blank=False, unique=True, default=uuid.uuid4)
    # Store the location searched by the user (lat-long)
    entry_location = models.PointField()
    # Store the polygon created by the user.
    entry_polygon = models.PolygonField()
    def __str__(self):
        return self.entry_ID

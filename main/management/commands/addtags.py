from django.core.management.base import BaseCommand, CommandError
from main.models import CommunityEntry
from django.contrib.auth import get_user_model

tags_arr = ["climate", "pollution", "gentrification", "religion", "agriculture", "sea level rise", "factory", "race", "tourism", "roads", "parks"]

class Command(BaseCommand):

    help = 'Adds a predefined list of tags to the database'

    def handle(self, *args, **options):
        self.user = get_user_model().objects.create_user(
            "johndoe", "john@doe.com", "johndoe"
        )
        commTest = CommunityEntry(user=self.user)
        commTest.save()
        for tag in tags_arr:
            commTest.tags.add(tag)
        commTest.delete()
        self.user.delete()

        self.stdout.write("Tags added successfully")

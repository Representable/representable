from django.core.management.base import BaseCommand, CommandError
from main.models import CommunityEntry
from django.contrib.auth import get_user_model

tags_arr = ["climate", "pollution", "gentrification", "religion", "agriculture", "sea level rise", "factory", "race", "tourism", "roads", "parks", "infrastructure", "military", "schools", "universities", "transportation", "LGBT+", "internet", "natural disasters", "food", "mining", "oil and gas", "historical", "tech", "renewable resources", "ranching", "libraries", "housing", "healthcare", "Indigenous", "immigration", "seasonal employment", "voting rights", "Covid-19", "diversity", "marijuana", "taxes", "welfare", "incarceration", "mental health", "policing", "nuclear", "unemployment", "homelessness", "crime", "gun control", "gun rights", "reproductive rights", "education", "farming", "entertainment", "young", "elderly", "pets", "environment", "coal", "nuclear energy", "energy", "coast", "ocean", "beach", "lake", "river", "bay", "island", "landmark", "organized crime", "corruption", "Black", "Asian", "Pacific Islander", "Latinx", "white", "public health", "small businesses", "large corporations", "automation", "art", "music", "activism", "sports", "water", "weather", "air quality", "flooding"]

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

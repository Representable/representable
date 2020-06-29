from django.test import TestCase, Client
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.contrib.auth import get_user_model
from .models import CommunityEntry

from main.views import EntryView
from main.forms import CommunityForm
from django.template import RequestContext
from django.template.loader import render_to_string


class EntryTest(StaticLiveServerTestCase):
    def setUp(self):
        # Create a fake user.
        self.client = Client()
        print("Testing Create User")

        self.user = get_user_model().objects.create_user(
            "johndoe", "john@doe.com", "johndoe"
        )
        c = self.client
        c.login(email="john@doe.com", password="johndoe")
        self.response = c.get("/entry/")

    def tearDown(self):
        # Fake user logout.
        print("Test User Logout")
        self.client.logout()

        # Destroy fake user.
        print("Test User Delete")
        self.user.delete()

    def test_template(self):
        # self.assertTemplateUsed(self.response, '/main/templates/main/entry.html')
        # Testing Page Active
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    # def test_get_absolute_url(self):
    #     print("Test create entry")
    #     entry = CommunityEntry.objects.create(user=self.user)
    #     self.assertFalse(entry.is_valid())
    #     #self.assertIsNotNone(entry.get_absolute_url())
    #     #CommunityForm.save(form)

    def test_empty_form(self):
        data = {}
        form = CommunityForm(data=data)
        self.assertFalse(CommunityForm.is_valid(form))

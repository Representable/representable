from django.test import TestCase, Client
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.contrib.auth import get_user_model

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
        # response = self.client.get("/")
        # self.assertTrue(response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

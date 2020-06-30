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
        # Testing Page Active
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    # def test_get_absolute_url(self):
    #     print("Test create entry")
    #     entry = CommunityEntry.objects.create(user=self.user)
    #     self.assertFalse(entry.is_valid())
    #     self.assertIsNotNone(entry.get_absolute_url())
    #     CommunityForm.save(form)

    def test_empty_form(self):
        # self.assertIsInstance(self.response.context['form'], CommunityForm)
        data = {"comm_activities": ""}
        form = CommunityForm(data=data)
        # self.assertEqual(
        #     form.errors['text'],
        #     ["User polygon missing. Please draw your community."]
        # )
        self.assertFalse(CommunityForm.is_valid(form))

    # Reference: www.obeythetestinggoat.com/book/chapter_simple_form.html
    def test_valid_form(self):

        data = {
            "entry_ID": "9330c85d-7d52-485f-ab18-78e336f3fd49",
            "user_id": 64,
        }
        form = CommunityForm(data=data)
        form.save()
        self.assertTrue(CommunityForm.is_valid(form))

    # def post_invalid_input(self):
    #     list_ = CommunityEntry.objects.create()
    #     return self.client.post(
    #         f'/lists/{list_.id}/',
    #         data={'text': ''}
    #     )
    #
    # def test_for_invalid_input_nothing_saved_to_db(self):
    #     self.post_invalid_input()
    #     self.assertEqual(CommunityEntry.objects.count(), 0)

    # def test_for_invalid_input_renders_list_template(self):
    #     self.response = self.post_invalid_input()
    #     self.assertEqual(self.response.status_code, 200)
    #     self.assertTemplateUsed(self.response, 'entry.html')

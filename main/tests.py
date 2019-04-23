from django.test import TestCase
from main.forms import CommunityForm
from django.test import Client
from main.views import EntryView
from django.contrib.auth import get_user_model


class CommunityEntryTest(TestCase):
    def setUp(self):
        '''
        This function is called before every test.
        Create and login a fake user.
        '''
        # Create a fake user.
        self.user = get_user_model().objects.create_user('johndoe', 'john@doe.com', 'johndoe')
        # Fake user login
        self.client.login(username='johndoe', password='johndoe')

    def tearDown(self):
        '''
        This function runs after every test. It deletes the fake user.
        '''
        self.user.delete()


    def test_valid_form(self):
        '''
        Test that the server returns the right form when /entry/ is requested.
        '''
        c = Client()
        response = c.get('/entry/')
        form = CommunityForm(initial=EntryView.get_initial())
        self.assertEqual(response.context['form'], form)
        self.assertEqual(response.context[mapbox_key], os.environ.get('DISTR_MAPBOX_KEY'))

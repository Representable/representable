#
# Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
#
# This file is part of Representable 
# (see http://representable.org).
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
from django.test import TestCase, Client
from main.forms import CommunityForm
from main.views import EntryView
from django.contrib.auth import get_user_model


class UserTest(TestCase):
    '''
    Unit tests for user sign-up, log-in, and log-out.
    '''

    def setUp(self):
        '''
        This function is called before every test.
        '''
        self.client = Client()

    def testSimpleGet(self):
        '''
        Test get main page, map page, and entry page.
        '''
        # Check index page.
        print("Testing Index Page")
        response = self.client.get('/')
        # Check that response is 200 OK.
        self.assertEqual(response.status_code, 200)

        # Check entry page.
        print("Testing Entry Page")
        response = self.client.get('/entry/')
        self.assertRedirects(response, '/accounts/login/?next=/entry/')

        # Check map page.
        # response = self.client.get('/map')
        # Print response.
        # self.assertEqual(response.status_code, 200)

    def testSimpleUser(self):
        '''
        Test create user/login/logout.
        https://stackoverflow.com/questions/22457557/how-to-test-login-process
        '''

        # Create a fake user.
        print("Testing Create User")
        self.user = get_user_model().objects.create_user('johndoe', 'john@doe.com', 'johndoe')

        # Fake user login.
        print("Testing User Login")
        self.client.login(username='johndoe', password='johndoe')
        response = self.client.get('/main/')
        self.assertTrue(response.context['user'].is_active)
        response = self.client.get('/entry/')
        self.assertEqual(response.status_code, 200)

        # Fake user logout.
        print("Test User Logout")
        self.client.logout()

        # Destroy fake user.
        print("Test User Delete")
        self.user.delete()


# class CommunityEntryTest(TestCase):
#     '''
#     Unit tests for community entry.
#     Includes tests for:
#         - Form
#         - Formset
#         - Model
#     '''
#     def setUp(self):
#         '''
#         This function is called before every test.
#         Create and login a fake user.
#         '''
#         # Create a fake user.
#         self.user = get_user_model().objects.create_user('johndoe', 'john@doe.com', 'johndoe')
#         # Fake user login
#         self.client.login(username='johndoe', password='johndoe')
#
#     def tearDown(self):
#         '''
#         This function runs after every test. It deletes the fake user.
#         '''
#         self.client.logout()
#         self.user.delete()
#
#
#
#     def test_valid_form(self):
#         '''
#         Test that the server returns the right form when /entry/ is requested.
#         '''
#         c = Client()
#         response = c.get('/entry/')
#         form = CommunityForm(initial=EntryView.get_initial())
#         self.assertEqual(response.context['form'], form)
#         self.assertEqual(response.context[mapbox_key], os.environ.get('DISTR_MAPBOX_KEY'))

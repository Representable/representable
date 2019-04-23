from django.test import TestCase
from main.forms import CommunityForm

class CommunityEntryTest(TestCase):
    def setUp(self):
        # Create a fake user.
        self.user = get_user_model().objects.create_user('johndoe', 'john@doe.com', 'johndoe')
        self.client.login(username=self.user.email, password='pass')

    def form_data(self, entry_ID, entry_polygon, race, religion,
                  industry, zipcode, tags):
        return CommunityForm(
            user=self.user,
            data={
                'user': user,
                'entry_ID': entry_ID,
                'entry_polygon': entry_polygon,
                'race': race,
                'religion': religion,
                'industry': industry,
                'zipcode': zipcode,
                'tags': tags
            }
        )

    def test_valid_data(self):
        c = self.client
        response = c.get('')
        form = self.form_data(, 'Last')
        self.assertTrue(form.is_valid())

    def test_missing_first_name(self):
        form = self.form_data('', 'Last')
        errors = form['first_name'].errors.as_data()
        self.assertEqual(len(errors), 1)
        self.assertEqual(errors[0].code, 'required')

    def test_missing_last_name(self):
        form = self.form_data('First', '')
        errors = form['last_name'].errors.as_data()

        self.assertEqual(len(errors), 1)
        self.assertEqual(errors[0].code, 'required')

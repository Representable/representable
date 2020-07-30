from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from .models import Organization, Membership, Drive, Report, CommunityEntry
from main.forms import OrganizationForm, DriveForm
from django.urls import reverse, reverse_lazy


class ReportAdminTest(TestCase):
    fixtures = ["report_test.json"]

    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.get_or_create(
            username="test_user"
        )[0]
        self.client.force_login(self.user)

    def tearDown(self):
        self.client.logout()
        self.user.delete()

    def test_create_report_admin(self):
        "Test report as org admin with view"
        community = CommunityEntry.objects.get(
            entry_ID="75c72870-f961-4240-9f44-a4afee93a658"
        )
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        org = drive.organization
        data = {
            "cid": community.id,
            "org_slug": org.slug,
            "drive_slug": drive.slug,
            "email": self.user.email,
            "is_org_admin": self.user.is_org_admin(org.id),
        }
        self.response = self.client.post("/report/", data, follow=True)
        rep = Report.objects.get(id=1)

        self.assertEqual(self.response.status_code, 200)
        self.assertTrue(rep)
        self.assertEqual(Report.objects.count(), 1)
        self.assertEqual(rep.community, community)
        self.assertFalse(rep.community.admin_approved)


class ReportUserTest(TestCase):
    fixtures = ["report_test.json"]

    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.get_or_create(
            username="test_member"
        )[0]
        self.client.force_login(self.user)

    def tearDown(self):
        self.client.logout()
        self.user.delete()

    def test_create_report_user(self):
        "Test report as signed in user but not admin with view"
        community = CommunityEntry.objects.get(
            entry_ID="75c72870-f961-4240-9f44-a4afee93a658"
        )
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        org = drive.organization
        data = {
            "cid": community.id,
            "org_slug": org.slug,
            "drive_slug": drive.slug,
            "email": self.user.email,
            "is_org_admin": self.user.is_org_admin(org.id),
        }
        self.response = self.client.post("/report/", data, follow=True)
        rep = Report.objects.get(community=community)

        self.assertEqual(self.response.status_code, 200)
        self.assertTrue(rep)
        self.assertEqual(Report.objects.count(), 1)
        self.assertTrue(rep.community.admin_approved)


class ReportNoUserTest(TestCase):
    fixtures = ["report_test.json"]

    def setUp(self):
        self.client = Client()

    def tearDown(self):
        self.client.logout()

    def test_create_report(self):
        "Test report as not logged in with view"
        community = CommunityEntry.objects.get(
            entry_ID="75c72870-f961-4240-9f44-a4afee93a658"
        )
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        org = drive.organization
        data = {
            "cid": community.id,
            "org_slug": org.slug,
            "drive_slug": drive.slug,
            "email": "fakeemail@fake.com",
            "is_org_admin": False,
        }
        self.response = self.client.post("/report/", data, follow=True)
        rep = Report.objects.get(community=community)

        self.assertEqual(self.response.status_code, 200)
        self.assertTrue(rep)
        self.assertEqual(Report.objects.count(), 1)
        self.assertTrue(rep.community.admin_approved)

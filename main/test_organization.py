from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from .models import Organization, Membership, Drive
from main.forms import OrganizationForm, DriveForm
from django.urls import reverse, reverse_lazy


class OrganizationAdminTest(TestCase):
    fixtures = ["single_org.json"]

    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.get_or_create(
            username="test_user"
        )[0]
        self.client.force_login(self.user)

    def tearDown(self):
        self.client.logout()
        self.user.delete()

    def test_create_organization_template(self):
        "Test creating organization with view"
        data = {
            "name": "Test Organization",
            "description": "Description",
            "ext_link": "",
            "states": ["NJ"],
        }
        self.response = self.client.post(
            "/dashboard/partners/create/", data, follow=True
        )
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    def test_organization_dashboard_home(self):
        "Test the dashboard home page"
        data = {
            "name": "Test Organization",
            "description": "Description",
            "ext_link": "",
            "states": ["NJ"],
        }

        org_form = OrganizationForm(data)
        try:
            org = org_form.save()
        except Exception as e:
            print(e)

        # by default, make the user creating the org the admin
        admin = Membership(
            member=self.user, organization=org, is_org_admin=True,
        )
        try:
            admin.save()
        except Exception as e:
            print(e)

        self.response = self.client.get(
            reverse("main:home_org", kwargs=org.get_url_kwargs())
        )
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    def test_org_absolute_url(self):
        "Test the absolute url of an organization"
        org = Organization.objects.get(id=1)
        self.response = self.client.get(org.get_absolute_url())
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    def test_dashboard_drive_page(self):
        "Test the dashboard drive page"
        org = Organization.objects.get(id=1)
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        drive_url = reverse(
            "main:drive_home",
            kwargs={"pk": org.id, "slug": org.slug, "cam_pk": drive.id},
        )

        self.response = self.client.get(drive_url)
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    def test_dashboard_drive_map(self):
        org = Organization.objects.get(id=1)
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        drive_url = reverse(
            "main:partner_map", kwargs={"slug": org.slug, "drive": drive.slug}
        )

        self.response = self.client.get(drive_url)
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    def test_dashboard_org_review(self):
        "Tests the org review page"
        org = Organization.objects.get(id=1)
        review_url = reverse(
            "main:review_org",
            kwargs={"pk": org.id, "slug": org.slug, "drive": ""},
        )

        self.response = self.client.get(review_url)
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    def test_dashboard_drive_review(self):
        "Tests the dashboard drive review page"
        org = Organization.objects.get(id=1)
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        drive_url = reverse(
            "main:review_org",
            kwargs={"pk": org.id, "slug": org.slug, "drive": drive.slug},
        )

        self.response = self.client.get(drive_url)
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)


class OrganizationMemberTest(TestCase):
    fixtures = ["single_org.json"]

    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.get_or_create(
            username="test_member"
        )[0]
        self.client.force_login(self.user)

    def tearDown(self):
        self.client.logout()
        self.user.delete()

    def test_organization_dashboard_home(self):
        org = Organization.objects.get(id=1)

        self.response = self.client.get(
            reverse("main:home_org", kwargs=org.get_url_kwargs())
        )
        self.assertEqual(self.response.status_code, 403)

    def test_org_absolute_url(self):
        "Test the absolute url of an organization"
        org = Organization.objects.get(id=1)
        self.response = self.client.get(org.get_absolute_url())
        self.assertEqual(self.response.status_code, 403)

    def test_dashboard_drive_page(self):
        "Test the dashboard drive page"
        org = Organization.objects.get(id=1)
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        drive_url = reverse(
            "main:drive_home",
            kwargs={"pk": org.id, "slug": org.slug, "cam_pk": drive.id},
        )

        self.response = self.client.get(drive_url)
        self.assertEqual(self.response.status_code, 403)

    def test_dashboard_drive_map(self):
        "Tests the drive map page (accessible to non admins)"
        org = Organization.objects.get(id=1)
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        drive_url = reverse(
            "main:partner_map", kwargs={"slug": org.slug, "drive": drive.slug}
        )

        self.response = self.client.get(drive_url)
        self.assertTrue(self.response.context["user"].is_active)
        self.assertEqual(self.response.status_code, 200)

    def test_dashboard_org_review(self):
        "Tests the org review page"
        org = Organization.objects.get(id=1)
        review_url = reverse(
            "main:review_org",
            kwargs={"pk": org.id, "slug": org.slug, "drive": ""},
        )

        self.response = self.client.get(review_url)
        self.assertEqual(self.response.status_code, 403)

    def test_dashboard_drive_review(self):
        "Tests the dashboard drive review page"
        org = Organization.objects.get(id=1)
        drive = Drive.objects.get(id="33345339-1fd6-4778-828d-f965192fcb28")
        drive_url = reverse(
            "main:review_org",
            kwargs={"pk": org.id, "slug": org.slug, "drive": drive.slug},
        )

        self.response = self.client.get(drive_url)
        self.assertEqual(self.response.status_code, 403)

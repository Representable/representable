from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from .models import CommunityEntry, Address

from main.views import EntryView
from main.forms import CommunityForm, AddressForm
from django.template import RequestContext
from django.template.loader import render_to_string
import uuid

# must be imported after other models
from django.contrib.gis.geos import Point, Polygon, MultiPolygon
from django.contrib.gis.db.models import Union
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry


class EntryTest(TestCase):
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
        self.client.logout()
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
        """
        Tests that an empty form is not valid.
        """
        data = {"comm_activities": ""}
        form = CommunityForm(data=data)
        # self.assertEqual(
        #     form.errors['text'],
        #     ["User polygon missing. Please draw your community."]
        # )
        self.assertFalse(CommunityForm.is_valid(form))

    # Reference 1: www.obeythetestinggoat.com/book/chapter_simple_form.html
    # Reference 2: https://micropyramid.com/blog/django-unit-test-cases-with-forms-and-views/
    # Reference 3: https://www.agiliq.com/blog/2019/01/django-formview/
    def test_valid_form(self):
        """
        Tests that a valid form works.
        """
        community_entry_count = CommunityEntry.objects.count()
        test_entry_id = uuid.uuid4()
        # Polygon from the Princeton, NJ area.
        test_user_polygon = "POLYGON((-74.67798754813946 40.350287285206235,-74.66723219285659 40.35216311168625,-74.66324575520535 40.34828906481454,-74.67372770832687 40.34435489217273,-74.67798754813946 40.350287285206235))"
        test_census_blocks_polygon_array = "POLYGON((-74.66634750366211 40.351123031789,-74.66574668884277 40.35017456869076,-74.6654462814331 40.34974939124777,-74.66694831848145 40.34916067959381,-74.66797828674316 40.35066515471735,-74.66634750366211 40.351123031789))|POLYGON((-74.66797828674316 40.35066515471735,-74.66694831848145 40.34916067959381,-74.66926574707031 40.34824489569556,-74.67072486877441 40.34991292135075,-74.66797828674316 40.35066515471735))|POLYGON((-74.67209815979004 40.35020727453693,-74.67119693756104 40.34991292135075,-74.67166900634766 40.34981480333656,-74.67201232910156 40.34961856687988,-74.67192649841309 40.34988021536188,-74.67209815979004 40.35020727453693))|POLYGON((-74.67377185821533 40.35095950462028,-74.67291355133057 40.35066515471735,-74.67222690582275 40.35033809776283,-74.67196941375732 40.350043745147644,-74.67192649841309 40.3497166851796,-74.6726131439209 40.34876820230292,-74.67329978942871 40.34808136154808,-74.67420101165771 40.34752534248071,-74.67527389526367 40.347067440983466,-74.67638969421387 40.348571962800975,-74.67570304870605 40.34886632183975,-74.6751880645752 40.34922609225356,-74.674973487854 40.34948774225822,-74.6744155883789 40.35033809776283,-74.67377185821533 40.35095950462028))"
        # Replicate steps from the EntryView post().
        polyArray = test_census_blocks_polygon_array.split("|")
        newPolyArr = []
        # union them one at a time- does not work
        for stringPolygon in polyArray:
            new_poly = GEOSGeometry(stringPolygon, srid=4326)
            newPolyArr.append(new_poly)

        mpoly = MultiPolygon(newPolyArr)
        polygonUnion = mpoly.unary_union
        polygonUnion.normalize()
        # if one polygon is returned, create a multipolygon
        if polygonUnion.geom_typeid == 3:
            polygonUnion = MultiPolygon(polygonUnion)
        test_census_blocks_polygon = polygonUnion
        data = {
            "entry_ID": test_entry_id,
            "user": self.user.id,
            "user_polygon": test_user_polygon,
            "census_blocks_polygon_array": test_census_blocks_polygon_array,
            "census_blocks_polygon": test_census_blocks_polygon,
            "entry_name": "test",
            "entry_reason": "test",
            "user_name": "johndoe",
            "cultural_interests": "",
            "economic_interests": "test",
            "comm_activities": "test",
            "other_considerations": "test",
        }
        entry_form = CommunityForm(data)
        # Form should pass now without the address form.
        self.assertTrue(CommunityForm.is_valid(entry_form))
        saved_entry_form = entry_form.save()
        # Check that the form was successfully added.
        self.assertTrue(
            CommunityEntry.objects.count() == community_entry_count + 1
        )

        # Address form test.
        address_count = Address.objects.count()
        address_form_data = {
            "street": "Test Street",
            "city": "Test City",
            "state": "Test State",
            "zipcode": "Test Zipcode",
        }
        address_form = AddressForm(address_form_data)
        self.assertTrue(AddressForm.is_valid(address_form))
        # Check that we can add a saved entry to an address.
        saved_address_form = address_form.save(commit=False)
        saved_address_form.entry = saved_entry_form
        saved_address_form.save()
        # Check that the address was successfully added.
        self.assertTrue(Address.objects.count() == address_count + 1)

    def test_invalid_interests(self):
        """
        Tests that at least one of the interest fields must be filled for valid form.
        """
        community_entry_count = CommunityEntry.objects.count()
        test_entry_id = uuid.uuid4()
        # Polygon from the Princeton, NJ area.
        test_user_polygon = "POLYGON((-74.67798754813946 40.350287285206235,-74.66723219285659 40.35216311168625,-74.66324575520535 40.34828906481454,-74.67372770832687 40.34435489217273,-74.67798754813946 40.350287285206235))"
        test_census_blocks_polygon_array = "POLYGON((-74.66634750366211 40.351123031789,-74.66574668884277 40.35017456869076,-74.6654462814331 40.34974939124777,-74.66694831848145 40.34916067959381,-74.66797828674316 40.35066515471735,-74.66634750366211 40.351123031789))|POLYGON((-74.66797828674316 40.35066515471735,-74.66694831848145 40.34916067959381,-74.66926574707031 40.34824489569556,-74.67072486877441 40.34991292135075,-74.66797828674316 40.35066515471735))|POLYGON((-74.67209815979004 40.35020727453693,-74.67119693756104 40.34991292135075,-74.67166900634766 40.34981480333656,-74.67201232910156 40.34961856687988,-74.67192649841309 40.34988021536188,-74.67209815979004 40.35020727453693))|POLYGON((-74.67377185821533 40.35095950462028,-74.67291355133057 40.35066515471735,-74.67222690582275 40.35033809776283,-74.67196941375732 40.350043745147644,-74.67192649841309 40.3497166851796,-74.6726131439209 40.34876820230292,-74.67329978942871 40.34808136154808,-74.67420101165771 40.34752534248071,-74.67527389526367 40.347067440983466,-74.67638969421387 40.348571962800975,-74.67570304870605 40.34886632183975,-74.6751880645752 40.34922609225356,-74.674973487854 40.34948774225822,-74.6744155883789 40.35033809776283,-74.67377185821533 40.35095950462028))"
        # Replicate steps from the EntryView post().
        polyArray = test_census_blocks_polygon_array.split("|")
        newPolyArr = []
        # union them one at a time- does not work
        for stringPolygon in polyArray:
            new_poly = GEOSGeometry(stringPolygon, srid=4326)
            newPolyArr.append(new_poly)

        mpoly = MultiPolygon(newPolyArr)
        polygonUnion = mpoly.unary_union
        polygonUnion.normalize()
        # if one polygon is returned, create a multipolygon
        if polygonUnion.geom_typeid == 3:
            polygonUnion = MultiPolygon(polygonUnion)
        test_census_blocks_polygon = polygonUnion
        data = {
            "entry_ID": test_entry_id,
            "user": self.user.id,
            "user_polygon": test_user_polygon,
            "census_blocks_polygon_array": test_census_blocks_polygon_array,
            "census_blocks_polygon": test_census_blocks_polygon,
            "entry_name": "test",
            "entry_reason": "test",
            "user_name": "johndoe",
            "cultural_interests": "",
            "economic_interests": "",
            "comm_activities": "",
            "other_considerations": "",
        }
        entry_form = CommunityForm(data)
        # Form should pass now without the address form.
        self.assertFalse(CommunityForm.is_valid(entry_form))
        errors = entry_form.errors
        expected_errors = {"cultural_interests": ["Blank interest fields."]}
        self.assertEqual(expected_errors, errors)
        expected_exception_error = ValueError(
            "The CommunityEntry could not be created because the data didn't validate."
        )
        try:
            entry_form.save()
        except Exception as e:
            exception_error = e
            print(
                f"Interests fields not filled raised an expected error {e}. No further action required."
            )
        self.assertTrue(
            type(expected_exception_error) is type(exception_error)
        )
        self.assertTrue(expected_exception_error.args == exception_error.args)
        # Check that a form with a bad polygon was not added to the DB.
        self.assertTrue(
            CommunityEntry.objects.count() == community_entry_count
        )

    def test_invalid_polygon(self):
        """
        Tests that a polygon with kinks is rejected despite everything else in the form being ok.

        Generate bad polygons with Wicket: https://arthur-e.github.io/Wicket/sandbox-gmaps3.html
        """
        test_bad_user_polygon = "POLYGON((-74.7378854049235 40.4557286668553,-74.64038174281413 40.41600892904132,-74.65274136195475 40.45050372617619,-74.70286648402507 40.38986472728497,-74.51197903285319 40.40502960106488,-74.77015774379069 40.4201910590012,-74.7378854049235 40.4557286668553))"

        community_entry_count = CommunityEntry.objects.count()
        test_entry_id = uuid.uuid4()

        # Polygons from the Princeton, NJ area. Won't be tested but must make sense.
        test_census_blocks_polygon_array = "POLYGON((-74.66634750366211 40.351123031789,-74.66574668884277 40.35017456869076,-74.6654462814331 40.34974939124777,-74.66694831848145 40.34916067959381,-74.66797828674316 40.35066515471735,-74.66634750366211 40.351123031789))|POLYGON((-74.66797828674316 40.35066515471735,-74.66694831848145 40.34916067959381,-74.66926574707031 40.34824489569556,-74.67072486877441 40.34991292135075,-74.66797828674316 40.35066515471735))|POLYGON((-74.67209815979004 40.35020727453693,-74.67119693756104 40.34991292135075,-74.67166900634766 40.34981480333656,-74.67201232910156 40.34961856687988,-74.67192649841309 40.34988021536188,-74.67209815979004 40.35020727453693))|POLYGON((-74.67377185821533 40.35095950462028,-74.67291355133057 40.35066515471735,-74.67222690582275 40.35033809776283,-74.67196941375732 40.350043745147644,-74.67192649841309 40.3497166851796,-74.6726131439209 40.34876820230292,-74.67329978942871 40.34808136154808,-74.67420101165771 40.34752534248071,-74.67527389526367 40.347067440983466,-74.67638969421387 40.348571962800975,-74.67570304870605 40.34886632183975,-74.6751880645752 40.34922609225356,-74.674973487854 40.34948774225822,-74.6744155883789 40.35033809776283,-74.67377185821533 40.35095950462028))"
        # Replicate steps from the EntryView post().
        polyArray = test_census_blocks_polygon_array.split("|")
        newPolyArr = []
        # union them one at a time- does not work
        for stringPolygon in polyArray:
            new_poly = GEOSGeometry(stringPolygon, srid=4326)
            newPolyArr.append(new_poly)

        mpoly = MultiPolygon(newPolyArr)
        polygonUnion = mpoly.unary_union
        polygonUnion.normalize()
        # if one polygon is returned, create a multipolygon
        if polygonUnion.geom_typeid == 3:
            polygonUnion = MultiPolygon(polygonUnion)
        test_census_blocks_polygon = polygonUnion

        data = {
            "entry_ID": test_entry_id,
            "user": self.user.id,
            "user_polygon": test_bad_user_polygon,
            "census_blocks_polygon_array": test_census_blocks_polygon_array,
            "census_blocks_polygon": test_census_blocks_polygon,
            "entry_name": "test",
            "entry_reason": "test",
            "user_name": "johndoe",
            "cultural_interests": "test",
            "economic_interests": "test",
            "comm_activities": "test",
            "other_considerations": "test",
        }
        entry_form = CommunityForm(data)
        # Form should fail.
        self.assertFalse(CommunityForm.is_valid(entry_form))
        # response = self.client.post("/entry", data, follow=True)
        errors = entry_form.errors
        expected_errors = {"user_polygon": ["Polygon contains kinks."]}
        self.assertEqual(expected_errors, errors)
        expected_exception_error = ValueError(
            "The CommunityEntry could not be created because the data didn't validate."
        )
        try:
            entry_form.save()
        except Exception as e:
            exception_error = e
            print(
                f"Saving bad polygon to DB raised an expected error: {e}. No further action required."
            )
        self.assertTrue(
            type(expected_exception_error) is type(exception_error)
        )
        self.assertTrue(expected_exception_error.args == exception_error.args)
        # Check that a form with a bad polygon was not added to the DB.
        self.assertTrue(
            CommunityEntry.objects.count() == community_entry_count
        )

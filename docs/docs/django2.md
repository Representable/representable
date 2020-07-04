---
id: django2
title: Entry Page
---

### The Entry Page

The entry page can be found at `representable.org/entry` and refers to the place where users actually add their COI (Community of Interest). The entry page plays multiple roles:

- Helps the user understand what a COI is with regard to the community they're a part of.
- Collects personal information that can be used to identify the user and verify that they are not a bad actor.
- Collects descriptive information about the community. This information can be used by map drawers and other interested actors to better understand the community.
- Helps the user draw and upload the COI map in a GIS-friendly format.

:::info
GIS stands for "Geographic Information System" and refers to the set of applications and technologies that can easily ingest, modify, and analyze spatial data. GIS-friendly formats refer to data files like Shapefiles and KMLs, which are popular in the GIS community. Click here to learn more: [Link](https://en.wikipedia.org/wiki/Geographic_information_system)
:::

The entry page is at the heart of Representable's architecture and it is closely linked to the way we store and organize data in our database. This is why understanding how the entry page works is essential to understanding how Representable.org works.

To understand how the entry page works, let's first understand how the /entry URL works.

#### Entry-related URL Paths

There are three types of entry page URL paths, as defined in `/main/urls.py`:

- `/entry/` is the default URL that will be used by most users. To access the `/entry/` URL, all you have to do is click on "Add community" in the navbar or go to `representable.org/entry`. This is the vanilla entry page.
- `/entry/c/<slug:drive>/` is the URL used by drives. This allows users to submit a COI directly to a drive organized by a partner organization. The `<slug:drive>` part refers strictly to the slug of the drive, e.g. `drive-name-slug`, which allows the entry to submit the form to the right place.
- `/entry/t/<token>` is the URL used for one-time tokens. This is still WIP.

#### The `EntryView` View

After a user goes to the URL, Django loads the associated view using `views.main.EntryView.as_view()`. `EntryView` (`/main/views/main.py`) is a class-based view (learn more about class-based views [here](https://docs.djangoproject.com/en/3.0/topics/class-based-views/)) that handles the `post` and `get` aspects of the entry page.

##### 1. `EntryView` declaration and class variables

```python
class EntryView(LoginRequiredMixin, View):
    """
    EntryView displays the form and map selection screen.
    """

    template_name = "main/pages/entry.html"
    community_form_class = CommunityForm
    address_form_class = AddressForm
    # form_class = CommunityForm
    initial = {
        "key": "value",
    }
    success_url = "/thanks/"
```

- `EntryView` subclasses `LoginRequiredMixin`, which is a mixin (learn more about mixins [here](https://docs.djangoproject.com/en/3.0/topics/class-based-views/mixins/)) that prevents non-authenticated users from accessing the page. `EntryView` also subclasses `View`, which is the generic Django view that handles linking the view into the URLs, HTTP method dispatching and other common features.
- `template_name = "main/pages/entry.html"` links to the Django HTML template used by this view.
- `community_form_class = CommunityForm` declares the custom **Model Form** used by the entry page. This form handles linking the database model to the form elements you see on the page. This is further explained below.
- `address_form_class` refers to the part of the form that handles addresses. This gets its own **Model Form** because it is customary to store addresses in a separate DB table from the rest of the information.
- `initial` stores information that pre-populates the form.
- `success_url` stores the URL of the page that the user is redirected to after the form is submitted successfully.

#### 2. `get_initial(self)`

The `get_initial()` function is used to pre-populate the form fields. In this case, the `get_initial()` function pre-populates the `user` field when it is called on a model form.

#### 3. `get(self, request, *args, **kwargs)`

The `get()` function overrides the generic View `get()`. This function is called whenever a user requests the entry page and gets the page ready for use. The `get()` function is responsible for two main tasks on the entry page:

- Pre-populate the `comm_form` (community form) and the `addr_form` (address form) using the `get_initial()` function.
- Set the right context variables. The context variables are used to pass information from the Python view and database to the HTML template and JS code.

If the user loads the view via the `/entry/c/<slug:drive>/` URL, the `get()` function will add drive-specific variables to the context, which allows the entry form to link the COI to a specific drive. This is done with the help of the `kwargs` parameter.

#### 4. `post(self, request, *args, **kwargs)`

The `post()` function overrides the generic View `post()` and it is called whenever the user attempts to submit the form on the entry page. The `post()` function handles logic specific to Representable.org, including:

- Checking if the form is valid by calling `comm_form.is_valid()`, which in turns calls `clean()` in the `CommunityForm` class in `forms.py`.
- Combines the census block polygons that make up the COI into one multipolygon (lines 410-431).
- If the user is using a drive URL, links the entry to the respective drive (lines 433-458).
- If the user is on the allow list for the organization, auto-approves the entry (displays it on the organization map) (lines 439-459).
- Checks that the address is valid and saves it.
- Redirects user to the right Thanks page (for drives or generic).
- Adds the right context variables.

Notes:

- We use `entryForm = comm_form.save(commit=False)` to store the contents of the form in the DB without commiting. This allows us to extract data from the form without triggering the NULL field error on the `census_blocks_polygon` field, since this field is filled programmatically.

### Database Models and Forms

`/main/models.py` stores the database schemas for all our models, including the `CommunityEntry` model, which contains all the fields we store for every COI. Here, we take advantage of Postgres, which is our database technology. We use Postgres becuase it is a great DB, but also because it allows us to use PostGIS, an extension that makes it easy to work with GIS-frinedly data in the database. This also gives us access to several GEO-related fields for the database, including `PolygonField` and `MultipolygonField`. This is also where the `Address` model is declared, which is linked to an entry through a Foreign Key. Learn more about models [https://docs.djangoproject.com/en/3.0/topics/db/models/](here).

To make our lives easier, Django allows us to build forms based on models. To do so, we use the `/main/forms.py` file, where the `CommunityForm` and `AddressForm` are declared and stored. You can learn more about model forms [https://docs.djangoproject.com/en/3.0/topics/forms/modelforms/](here).

Among other things, model forms allow us to display custom error messages and validate/clean the form. This is where we can programmatically reject the form submission and let the user know why the form did not go through. To do so, we wrote the `clean()` function, which checks that the user polygon contains no kinks (overlapping lines) and that the user filled at least one of the four interests in the second section of the form. We communicate the errors to the front-end template through the `errors` variable.

### Front-end Template and Javascript

The front-end template is integral to the entry form. This is because the template displays the form in a user-accessible way, but also because the template integrates the JavaScript code that enables different form error checking and the map drawing feature.

#### Map Drawing

The map drawing section is one of the most complex in the Representable.org app. The code for this section is written in `/main/static/main/js/geo.js`, which contains a set of scripts that:

- Handle map states.
- Add custom buttons to the map.
- Display custom error codes during the map drawing process.

:::caution

The map drawing section is a work in progress.

:::

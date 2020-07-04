---
id: django1
title: Overview
---

### Project Structure

The Django project has one central app called `main`. You'll notice there's a `representable` folder - this mostly contains the settings and central `urls.py` file. Futhermore, there's a `viz` folder and a `docs` folder (each are separate React apps). For the purpose of this tutorial, we'll mainly discuss the `main` folder.

#### Django `main` Structure

The `main` application is structured as listed below. Here's some quick definitions that cover the most important files and folders:

- `static`: where images, js files, and css files are stored
- `templates`: HTML files that serve all of these files
- `views` : Creates views that serve templates, optionally with content from the database.
- `urls.py`: Handles `url` routing and displays the views.
- `models.py`: Where Database models are created
- `forms.py`: Where custom forms are created
- `test.py`: Where the unit tests go

```
📦main
 ┣ 📂context_processors
 ┣ 📂migrations
 ┣ 📂static
 ┣ 📂templates
 ┣ 📂templatetags
 ┣ 📂views
 ┣ 📜__init__.py
 ┣ 📜admin.py
 ┣ 📜apps.py
 ┣ 📜forms.py
 ┣ 📜models.py
 ┣ 📜tests.py
 ┣ 📜urls.py
 ┗ 📜utils.py
```

The templates and views folders are structured into four main categories:

- `drives`: public templates/views for drives launched by organizations
- `dashboard`: private templates/views for managing submissions and launching drives.
- `partners`: public templates/views for organization/partner pages
- `pages`: static pages

### Helpful Links

- Django 2.2 Docs: [Link](https://docs.djangoproject.com/en/2.2/)
- Introduction to Django Templates: [Link](https://djangobook.com/mdj2-django-templates/)
- Guide to Django Models: [Link](https://simpleisbetterthancomplex.com/tips/2018/02/10/django-tip-22-designing-better-models.html)

### Official Colors

- Light Blue (Active States/Buttons):`#2A94F4`
- Light Green (Active States/Buttons): `#00C6A7`
- Dark Blue (Inactive States/Buttons): `#2176C2`
- Dark Green (Inactive States/Buttons): `#00B094`

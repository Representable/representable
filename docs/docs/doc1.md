---
id: doc1
title: Getting Started
---

### 1. Create a virtual environment

```
pip install virtualenv --user
virtualenv venv
. venv/bin/activate
# when done with work:
deactivate
```

### 2. Install requirements

```
pip install -r requirements.txt
```

### 3. Add Environment variables

You can find the mapbox API key referenced below by logging into the Mapbox.com account.

```
vim ~/.bash_profile
# Add the following lines:
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
export DISTR_DB_PASS="..."
export DISTR_MAPBOX_KEY="COPY_THIS_FROM_MAPBOX_ACCOUNT"
export DJANGO_SETTINGS_MODULE=representable.settings.dev
```

Save and launch a new terminal session.

### 4. Follow postgres, mapbox setup instructions

See the next docs page for details.

### 5. Start server

```
cd representable
python manage.py migrate
python manage.py runserver
```

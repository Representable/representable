---
id: doc1
title: Starting the Django Server
---

### 1. Add database and Mapbox settings to your local environment

From the Terminal, add the following settings to your `.bash_profile`. Everything you add to the `.bash_profile` will become part of your local environment. 

First, type:
```
nano ~/.bash_profile
```

Then paste the following lines into the file, replacing the "..."'s with your own settings (new contributors, Lauren is sending these credentials to you directly).

```
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
export DISTR_DB_PASS="..."
export SECRET_KEY="..."
export MAPBOX_USER_NAME="..."
export DISTR_MAPBOX_KEY="..."
export DJANGO_SETTINGS_MODULE=representable.settings.dev
```

To save these changes, press `Ctrl-X` then `Y`. After saving the file, **restart the Terminal** for the changes to go into effect.

### 2. Change into your local directory

From Terminal, change into the local directory to where you cloned the Representable codebase locally. For example:

```
cd representable
```

### 3. Install pre-commit

Pre-commit is a framework to make your code prettier and catch any mistakes before you push it to the live
codebase.

You can install it as follows on MacOS:

```
brew install pre-commit
```

After running the line above, type:

```
pre-commit install
```

For non-Mac users, visit the [pre-commit website](https://pre-commit.com/) for alternative setup instructions.

### 4. Create a virtual environment

```
pip install virtualenv --user
virtualenv venv
. venv/bin/activate
```

### 5. Install requirements

```
pip install -r requirements.txt
```

### 6. Start server

```
python manage.py migrate
python manage.py runserver
```

### 7. Open the local server

Visit your browser at http://127.0.0.1:8000/ to see the website! Now you're all set to start contributing.

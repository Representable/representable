---
id: doc1
title: Starting the Django Server
---

### 1. Change your directory to where you cloned the Representable codebase locally

For example:

```
cd representable
```

### 2. Install pre-commit

Pre-commit is a framework to make your code prettier and catch any mistakes before you push it to the live
codebase.

You can install it as follows on MacOS:

```
brew install pre-commit
```

Then type:

```
pre-commit install
```

For non-Mac users, visit the [pre-commit website](https://pre-commit.com/) for alternative setup instructions.

### 3. Create a virtual environment

```
pip install virtualenv --user
virtualenv venv
. venv/bin/activate
```

### 4. Install requirements

```
pip install -r requirements.txt
```

### 5. Start server

```
python manage.py migrate
python manage.py runserver
```

### 6. Open the local server

Visit your browser at http://127.0.0.1:8000/ to see the website!

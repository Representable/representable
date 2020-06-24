---
id: server
title: Running the Server
---

### 1. Check that your virtual environment is activated

If you haven't created your virtual environment, please return to the [previous docs page](doc1).

### 2. Check that you've installed requirements

You can skip this if you just installed the requirements, but always remember to re-install requirements each time new dependencies are added!

```
pip install -r requirements.txt
```

### 3. Run migrations

This will update your database with the latest model changes.

```
python manage.py migrate
```

### 4. Start the server

```
python manage.py runserver
```

### 5. Open the local server

Visit your browser at http://127.0.0.1:8000/ to see the website! Now you're all set to start contributing.

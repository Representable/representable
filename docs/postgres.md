# Postgres Steps

_by Theodor Marcu (Reach out if you have questions!)_

Taken from https://medium.com/agatha-codes/painless-postgresql-django-d4f03364989.

1. Install required requirements `pip install -r requirements.txt`.
2. Install PostgreSQL from: https://postgresapp.com/downloads.html. Choose the first download option: Postgres.app with PostgreSQL 11. If you don't already have postgres, do "brew install postgres".
3. Make sure to start a Postgres server. Use the default settings on Port 5432.
4. Create a Postgres user with the DISTR_DB_USER, a database with DISTR_DB_NAME, and password DISTR_DB_PASS.
5. Create the database from the command line:

```
# open postgres
psql postgres
CREATE DATABASE <DISTR_DB_NAME>;
CREATE USER <DISTR_DB_USER> WITH encrypted password <DISTR_DB_PASS>;
GRANT ALL PRIVILEGES ON DATABASE <DISTR_DB_NAME> to <DISTR_DB_USER>;
```

6. Add the following to your bash_profile:

```
# Representable Stuff
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
export DISTR_DB_PASS="..."
```

And then Ctrl^x and press Y to exit.

7. Restart the bash terminal for changes to go into effect.

8. You can now run `python manage.py runserver` without issues!

# Postgres Steps
_by Theodor Marcu (Reach out if you have questions!)_

Taken from https://medium.com/agatha-codes/painless-postgresql-django-d4f03364989.

1. Install required requirements `pip install -r requirements.txt`.
2. Install PostgreSQL from: https://postgresapp.com/downloads.html. Use the default settings on Port 5432.
3. Make sure to start a Postgres server.
4. Use the information I texted you to create a Postgres user with the DISTR_DB_USER, a database with DISTR_DB_NAME, and password DISTR_DB_PASS.
5. Create the database from the command line:
```
# open postgres
psql postgres
CREATE DATABASE <DB_NAME>;
```
5. Add the following to your .bash_profile or .bashrc (copy/paste, then change the ...s ).

On a Mac terminal, type:
```
cd ~
nano .bashrc
```

Add these lines:
```
# Districter Stuff
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
export DISTR_DB_PASS="..."
```
And then Ctrl^x and press Y to exit.

6. Restart the bash terminal for changes to go into effect.

This is so that we don't store passwords/info in cleartext. Ask me for them if you don't have them anymore!
7. You can now run `python manage.py runserver` without issues!

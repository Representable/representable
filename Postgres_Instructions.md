# Postgres Steps
_by Theodor Marcu (Reach out if you have questions!)_

Taken from https://medium.com/agatha-codes/painless-postgresql-django-d4f03364989.

1. Install required requirements `pip install -r requirements.txt`.
2. Install PostgreSQL. I just have the Postgres.app running with default settings. I recommend the same. https://wiki.postgresql.org/wiki/Detailed_installation_guides
3. Make sure to start a Postgres server.
<<<<<<< HEAD
4. Add the following to your .bash_profile/.bashrc (copy/paste, then change the ...s ).
=======
4. Use the information I texted you to create a Postgres user with the DISTR_DB_USER, a database with DISTR_DB_NAME, and password DISTR_DB_PASS. The tutorial on how to create a postgres db using the command-line is in the link above (Steps 1 and 2).
5. Add the following to your .bash_profile/.bashrc (copy/paste, then change the ...s ).
>>>>>>> theodor
```
# Districter Stuff
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
export DISTR_DB_PASS="..."
```
<<<<<<< HEAD
This is so that we don't store passwords in cleartext. Ask me for them if you don't have them anymore!
5. You can now run `python manage.py runserver` without issues!
=======
This is so that we don't store passwords/info in cleartext. Ask me for them if you don't have them anymore!
6. You can now run `python manage.py runserver` without issues!
>>>>>>> theodor

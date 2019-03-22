# Postgres Steps
_by Theodor Marcu (Reach out if you have questions!)_

Taken from https://medium.com/agatha-codes/painless-postgresql-django-d4f03364989.

1. Install required requirements `pip install -r requirements.txt`.
2. Install PostgreSQL. I just have the Postgres.app running with default settings. I recommend the same. https://wiki.postgresql.org/wiki/Detailed_installation_guides
3. Make sure to start a Postgres server.
4. Add the following to your .bash_profile/.bashrc (copy/paste, then change the ...s ).
```
# Districter Stuff
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
export DISTR_DB_PASS="..."
```
This is so that we don't store passwords in cleartext. Ask me for them if you don't have them anymore!
5. You can now run `python manage.py runserver` without issues!

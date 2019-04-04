# Postgres Steps
_by Theodor Marcu (Reach out if you have questions!)_

Taken from https://medium.com/agatha-codes/painless-postgresql-django-d4f03364989.

1. Install required requirements `pip install -r requirements.txt`.
2. Install PostgreSQL from: https://postgresapp.com/downloads.html. Choose the first download option: Postgres.app with PostgreSQL 11. If you don't already have postgres, do "brew install postgres".
3. Make sure to start a Postgres server. Use the default settings on Port 5432.
4. Use the information I texted you to create a Postgres user with the DISTR_DB_USER, a database with DISTR_DB_NAME, and password DISTR_DB_PASS.
5. Create the database from the command line:
```
# Open postgres
psql postgres
# Create user
CREATE USER <DISTR_DB_USER> WITH encrypted password '<DISTR_DB_PASS>';
# Give User CREATEDB ability
ALTER ROLE <DISTR_DB_USER> WITH CREATEDB;
# Check that your user was set up correctly
\du
# Crate DB
CREATE DATABASE <DISTR_DB_NAME> WITH OWNER <DISTR_DB_USER>;
GRANT ALL PRIVILEGES ON DATABASE <DISTR_DB_NAME> to <DISTR_DB_USER>;
# Check that DB was created correctly
\l
```

6. Add the following to your .bash_profile and .bashrc (copy/paste, then change the ...s ). This is so that we don't store passwords/info in cleartext. Ask me for them if you don't have them anymore!

On a UNIX (Mac/Linux) terminal, type:
```
cd ~
nano .bash_profile
```

Add these lines:
```
# Districter Stuff
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
export DISTR_DB_PASS="..."
```
And then Ctrl^x and press Y to exit.


7. Install GeoDjango (https://docs.djangoproject.com/en/2.1/ref/contrib/gis/install/#postgres-app):

##### MacOS
```
# Check if you have Homebrew installed (Mac):
brew -v
# You should see something like this:
Homebrew 2.0.6
Homebrew/homebrew-core (git revision 80028; last commit 2019-03-26)
Homebrew/homebrew-cask (git revision f7063; last commit 2019-03-26)
# If you don't see the above, head to https://brew.sh and install Homebrew. (Follow instructions there.)
# After you check that Homebrew is installed, install `gdal` and `libgeoip`.
brew install gdal
brew install libgeoip
# Open the districter_db DB and add/check that PostGIS is added.
psql districter_db
CREATE EXTENSION postgis;
# Add this line to your .bash_profile. Replace X and Y with your Postgres.app version (e.g. .../11.2/bin)
export PATH=$PATH:/Applications/Postgres.app/Contents/Versions/X.Y/bin
```
##### Linux

Take a look at these:
i. https://docs.djangoproject.com/en/2.1/ref/contrib/gis/install/geolibs/
ii. https://docs.djangoproject.com/en/2.1/ref/contrib/gis/install/postgis/

8. Close terminal and

7. Restart the bash terminal for changes to go into effect.

8. You can now run `python manage.py runserver` without issues!

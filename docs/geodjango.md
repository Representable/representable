# GeoDjango and Postgres Tutorial
_by Theodor Marcu (Reach out if you have questions!)_

Taken from https://medium.com/agatha-codes/painless-postgresql-django-d4f03364989 and adapted.

1. Install required requirements `pip install -r requirements.txt`.
2. Install PostgreSQL from: https://postgresapp.com/downloads.html. Choose the first download option: Postgres.app with PostgreSQL 11. If you don't already have postgres, do "brew install postgres".
3. Make sure to start a Postgres server. Use the default settings on Port 5432.
4. Use the information I texted you to create a Postgres user with the DISTR_DB_USER, a database with DISTR_DB_NAME, and password DISTR_DB_PASS.
5. Create the user and database from the command line:
```
# Open postgres
psql postgres
# Create user
CREATE USER districter WITH encrypted password '<pass_here>';
# Give User permission to create databases
ALTER ROLE districter WITH CREATEDB;
# Check that your user was set up correctly
\du
# Crate DB
CREATE DATABASE districter_db WITH OWNER districter;
GRANT ALL PRIVILEGES ON DATABASE districter_db to districter;
# Check that DB was created correctly
\l
```

6. Add the following to your .bash_profile and .bashrc (copy/paste, then change the ...s ). This is so that we don't store passwords/info in clear text. Ask me for them if you don't have them anymore!

On a UNIX (Mac/Linux) terminal, type:
```
nano ~/.bash_profile
```

Add these lines:
```
# Districter Stuff
export DISTR_DB_NAME="districter_db"
export DISTR_DB_USER="districter"
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
# Save
```
##### Linux

```
# Install GEOS from source
wget https://download.osgeo.org/geos/geos-3.7.1.tar.bz2
tar xjf geos-3.7.1.tar.bz2
cd geos-3.7.1
./configure
make
sudo make install
# Install PROJ.4 from source
wget https://download.osgeo.org/proj/proj-6.0.0.tar.gz
wget https://download.osgeo.org/proj/proj-datumgrid-1.8.tar.gz
tar xzf proj-6.0.0.tar.gz
cd proj-6.0.0/data
tar xzf ../../proj-datumgrid-X.Y.tar.gz
cd ..
./configure
make
sudo make install
# Install GDAL from source
wget https://download.osgeo.org/gdal/2.4.1/gdal-2.4.1.tar.gz
tar xzf gdal-2.4.1.tar.gz
cd gdal-2.4.1
./configure
make # this literally takes an hour
sudo make install
# Install PostGIS
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt bionic-pgdg main" >> /etc/apt/sources.list'
wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install postgresql-10-postgis-2.4
sudo apt install postgresql-10-postgis-scripts
sudo apt install postgresql-10-pgrouting
psql -U postgres
CREATE EXTENSION postgis
```

8. Close terminal, open a new one. Restart Postgres.app too.

9. Go into `settings.py` and change the DB Engine to:

```
# Settings.py DB Engine under DATABASES. Replace ENGINE with the following line:
'ENGINE': 'django.contrib.gis.db.backends.postgis',
```

10. Add GIS to INSTALLED_APPS:

```
# Add the following line as is:
'django.contrib.gis',
```

11. Save. Run makemigrations, migrate, and collectstatic.

```
# Make Migrations
python manage.py makemigrations
# Migrate
python manage.py migrate
# collectstatic
python manage.py collectstatic
```

12. Restart the bash terminal for changes to go into effect (Just in case at this point).

13. You can now run `python manage.py runserver` without issues! 🌎

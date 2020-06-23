---
id: geodjango
title: PostGIS/GeoDjango Installation
---

This tutorial will guide you through the installation of PostGIS, an extension for Postgres that enables it to store Geographic data directly in the database.

## On MacOS

#### 1. Install Postgres and Geo Libraries

```
brew install postgis
brew install gdal
brew install libgeoip
brew install libmemcached
```

#### 2. Create PostGis Extension

Run these lines in the terminal. Note: you must have created your Postgres database in the previous tutorial for this to work!

```
psql representable_db
```

```
CREATE EXTENSION postgis;
```

## On Linux

:::caution

The postgis libraries referenced here are out of date and should be updated to Postgres12.

:::

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
make
sudo make install
# Install PostGIS
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt bionic-pgdg main" >> /etc/apt/sources.list'
wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install postgresql-10-postgis-3
sudo apt install postgresql-10-postgis-scripts
sudo apt install postgresql-10-pgrouting
psql -U postgres
CREATE EXTENSION postgis
```

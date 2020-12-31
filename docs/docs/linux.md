---
id: linux
title: Linux Setup Guide
---

# Setup Representable on Ubuntu 20.04

Up to date as on Nov 2020.

## Prerequisites

Python 3.8 will not work - you need python 3.7. We will use [Pyenv](https://realpython.com/intro-to-pyenv/#installing-pyenv) to handle multiple versions of python.

Check you python version. If it is 3.7, move on.
```
$ python3 -V
```

If not, install dependencies since Pyenv builds from scratch.
```
$ sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev python-openssl
```

Download and install Pyenv.
```
$ curl https://pyenv.run | bash
```

Configure Pyenv by editing you bashrc file. Open the file and append the following text:
```
$ nano ~/.bashrc
```
```
# Load pyenv automatically 
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
```

Check Pyenv installed properly.
```
$ pyenv doctor
```

Now you can use pyenv! Make sure to install 3.7.
```
# To see what you can install
$ pyenv install --list

# To install a version
$ pyenv install -v 3.7.3

# To uninstall a version
$ pyenv uninstall 2.7.15

# To set local directory to a version
$ pyenv local 3.7.3

# To set global version
$ pyenv global 2.7.15

# To set global version back to system default
$ pyenv global system

# To see what versions are available
$ pyenv versions

# To check what python verion you are using right now
$ python -V
```

## Configure and install PostgreSQL

First, install packages for Postgres and Python development
```
$ sudo apt update
$ sudo apt install python3-pip python3-venv python3-dev libpq-dev postgresql postgresql-contrib
```

Restart the terminal and then start postgres. Hopefully this works:
```
$ sudo su - postgres
$ psql
```

If psql doesnt work, go back to your regular user and do this.
```
# see what's running and on what port - confirm postgres is down
$ pg_lsclusters

# restart postgres
$ sudo pg_ctlcluster 12 main start
$ sudo service postgresql restart

# confirm postgres works and is on port 5432
$ pg_lsclusters

# this should now work
$ sudo -u postgres psql

# to exit psql and postgres
\q
$ exit
```

Now create a new database and user
```
$ sudo -u postgres psql
CREATE USER representable WITH PASSWORD '...';
CREATE DATABASE representable_db WITH OWNER representable;
```

Verify your user and database exists, then exit
```
\l
\du
\q
$ exit
```
## Install POST GIS

First the dependency libraries need to be installed
```
$ sudo apt-get install binutils libproj-dev gdal-bin
```

Next install PostGIS
```
$ sudo apt install postgresql-12-postgis-3 postgresql-12-postgis-scripts postgresql-12-pgrouting postgresql-server-dev-12
```

Now setup postgis in psql
```
$ sudo -u postgres psql
CREATE EXTENSION postgis
\q
$ exit
```

## Configure local environment

Open bashrc and append the following: Get the enviornment variables from someone.
```
$ nano ~/.bashrc
```
```
# representable variables
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
...
```

## Setup local repo

Clone the repo
```
$ git clone https://github.com/Representable/representable.git
```

Create and enter virtual enviornment. You should see something like `(venv) user:~$ ` if successful
```
$ python -m venv venv
$ source venv/bin/activate
# to deactivate virtual enviornment: "$ deactivate"
```

Install python prereqs
```
$ pip install -r requirements.txt
```

## 5 | Run the server

First migrate database changes.
```
$ python manage.py migrate
```

If migration has a `peer authenticaion` error: just turn that off. We edit postgres's configuration file, and replace the top line with the bottom line:
```
$ sudo nano /etc/postgresql/12/main/pg_hba.conf
```
```
# find and replace this line  
local   all             all                                     peer    
# with this
local   all             all                                     trust    
```

If migration gets a `must be superuser` error: make your user a superuser.
```
$ sudo -u postgres psql
ALTER USER representable SUPERUSER;
ALTER ROLE representable WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE representable_db to representable;
```

Now migration should work and you should get some output like:
```
(venv) $ python manage.py migrate
Operations to perform:
  Apply all migrations: account, admin, auth, contenttypes, main, sessions, sites, socialaccount
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0001_initial... OK
  ...
```

You are good to go. Run the server and visit `http://localhost:8000/` to see it in action
```
$ python manage.py runserver
```

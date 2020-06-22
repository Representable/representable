---
id: postgres
title: Postgres Installation
---

This tutorial will guide you through the installation of Postgres, a relational database.

## On MacOS

#### 1. Run the following command from Terminal to download Postgres

```
brew install postgresql
```

#### 2. Download Postgres.app

Install the Postgres.app client from: https://postgresapp.com/downloads.html. Choose the first download option: Postgres.app with PostgreSQL 12.

#### 3. Start a Postgres server. Use the default settings on Port 5432.

#### 4. Open Terminal and run:

```
psql postgres
```

#### 5. Next, run the following lines to create the local database, after modifying the first line to include the proper DB password:

```
CREATE USER representable WITH encrypted password 'INSERT PASSWORD HERE';
ALTER ROLE representable WITH CREATEDB;
CREATE DATABASE representable_db WITH OWNER representable;
GRANT ALL PRIVILEGES ON DATABASE representable_db to representable;
```

## On Linux/Windows

Follow the instructions linked [here](https://medium.com/agatha-codes/painless-postgresql-django-d4f03364989). This section is under construction.

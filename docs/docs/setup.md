---
id: setup
title: First Steps
---

Hello and welcome to the Representable.org Docs! This guide will lead you through setting up your local development environment and how to contribute to different parts of the website.

## 1. Recommended Setup

### Required Packages:

| Name                      | Description                                                                                                       | Installation                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Homebrew (Mac/Linux only) | Package installer for Mac/Linux                                                                                   | [Link](https://brew.sh/)                                        |
| Python3                   | Open source programming language. Note: Mac users can run `brew install python` as a shortcut.                    | [Link](https://realpython.com/installing-python/)               |
| pip                       | Python package installer, installed by default but needs to be upgraded.                                          | [Link](https://pip.pypa.io/en/stable/installing/#upgrading-pip) |
| yarn                      | Package manager for node (used for our React projects). Note: Mac users can run `brew install yarn` as a shorcut. | [Link](https://classic.yarnpkg.com/en/docs/install/#mac-stable) |

### Postgres Installation:

#### Mac Users:

1. Run the following command from Terminal

```
brew install postgresql
```

2. Download Postgres.app

Install PostgreSQL from: https://postgresapp.com/downloads.html. Choose the first download option: Postgres.app with PostgreSQL 12.

3. Start a Postgres server. Use the default settings on Port 5432.

4. Open Terminal and run:

```
psql postgres
```

5. Next, run the following lines to create the local database:

```
CREATE USER representable WITH encrypted password 'representable333';
ALTER ROLE representable WITH CREATEDB;
CREATE DATABASE representable_db WITH OWNER representable;
GRANT ALL PRIVILEGES ON DATABASE representable_db to representable;
```

### Highly Suggested Tools:

| Name               | Description                                                    | Installation                           |
| ------------------ | -------------------------------------------------------------- | -------------------------------------- |
| VS Code            | IDE/Code Editor                                                | [Link](https://code.visualstudio.com/) |
| GitHub Desktop     | Desktop client for GitHub                                      | [Link](https://desktop.github.com/)    |
| Postico (Mac Only) | A modern PostgreSQL client that lets you inspect your database | [Link](https://eggerapps.at/postico/)  |

### 2. Cloning the Repo

The easiest way to clone the repo to begin editing locally is to visit the Github repository and click `Clone or download` then `Open in Desktop`.

![clone](/img/clone.png "Cloning the repo")

Alternatively, you can open Terminal and write:

```
git clone https://github.com/Representable/representable.git
```

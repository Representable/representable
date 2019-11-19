# Representable
Crowdsourced redistricting tool. Draw your community of interest and make your voice heard. In early stages of development.


### Create a virtual environment:
_Steps from https://www.cs.princeton.edu/courses/archive/spring19/cos333/a4.html_
**The name pyenv is in the gitignore so as long as you name your env "pyenv" as per instructions it will not be committed.**
```
$ pip install virtualenv --user
$ virtualenv pyvenv
$ . pyenv/bin/activate
# when done with work:
$ deactivate
```
### Add requirements from *pyenv* to requirements.txt
```
# Save requirements in repository. This puts all the pip packages required to run the server in requirements.txt
$ pip freeze > requirements.txt
# Load requirements from existing file. This installs all the packages mentioned in requirements.txt.
$ pip install -r requirements.txt
```

### Check out a branch:
```
git checkout -b branchname
git push origin branchname
```

### Switch to master or already existing branch:
```
git checkout master
git checkout branchname
```

### Add Environment Variables
You can find the mapbox API key referenced below by logging in the Mapbox.com account.
```
# Navigate to your root directory.
cd ~
# open your .bash_profile (or .bashrc, etc.) in your favorite text editor.
vim .bash_profile
# Add the following lines (dummy strings):
export DISTR_DB_NAME="..."
export DISTR_DB_USER="..."
export DISTR_DB_PASS="..."
export DISTR_MAPBOX_KEY="COPY_THIS_FROM_MAPBOX_ACCOUNT"
# Save and launch a new terminal session.
```

### Start server:
```
cd representable
python manage.py migrate
python manage.py runserver
```

### To delete heroku variable:
heroku config:unset DISABLE_COLLECTSTATIC


### Representable Colors

Primary Color: <span style="background-color: #2A94F4; color: white;">#2A94F</span>

Primary Color - Dark: <span style="background-color:#2176C2; color: white;">#2176C2</span>

Secondary Color: <span style="background-color:#00C6A7; color: white;">#00C6A7</span>

Secondary Color - Dark: <span style="background-color:#00B094; color: white;">#00B094</span>

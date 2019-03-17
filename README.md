# Districter
Crowdsourced redistricting tool. Draw your community of interest and make your voice heard. In early stages of development.


### Create a virtual environment
_Steps from https://www.cs.princeton.edu/courses/archive/spring19/cos333/a4.html
_
```
$ pip install virtualenv --user  
$ virtualenv pyvenv                 
$ . pyenv/bin/activate
# when done with work:
$ deactivate                      
```

### Check out a branch
```
git checkout -b branchname
git push origin branchname
```

### Switch to master or already existing branch
```
git checkout master
git checkout branchname
```

### Start server
```
cd districter
python manage.py migrate
python manage.py runserver
```

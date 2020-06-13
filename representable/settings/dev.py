from .base import *

ALLOWED_HOSTS = ["*"]

SECURE_SSL_REDIRECT = False

DEBUG = True

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

MIXPANEL_TOKEN = "ce31fc3e8e15a16619bb3672f9c25407"

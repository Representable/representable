from .base import *

ALLOWED_HOSTS = ["*"]

SECURE_SSL_REDIRECT = False

DEBUG = True

# Dev Email Settings - Print to Console
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
# Use Custom Debugging Email Adapter that prints a simple text message.
# See docs for context: https://django-allauth.readthedocs.io/en/latest/advanced.html#sending-email
ACCOUNT_ADAPTER = "main.users.adapter.DebugAdapter"

MIXPANEL_TOKEN = "ce31fc3e8e15a16619bb3672f9c25407"

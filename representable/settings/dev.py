from .base import *
import os

ALLOWED_HOSTS = ["*"]

SECURE_SSL_REDIRECT = False

DEBUG = True

# Dev Email Settings - Print to Console
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
# Use Custom Debugging Email Adapter that prints a simple text message.
# See docs for context: https://django-allauth.readthedocs.io/en/latest/advanced.html#sending-email
# ACCOUNT_ADAPTER = "main.users.adapter.DebugAdapter"

# Delete before pushing
# Production Email Settings
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# Uses default Account Adapter.
# SMTP Server Settings

# Delete before pushing:
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
EMAIL_PORT = 587
EMAIL_USE_TLS = True

MIXPANEL_TOKEN = "ce31fc3e8e15a16619bb3672f9c25407"

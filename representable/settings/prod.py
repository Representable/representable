from .base import *
import os

# https://help.heroku.com/J2R1S4T8/can-heroku-force-an-application-to-use-ssl-tls
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

# only allow requests from domain
ALLOWED_HOSTS = [
    "www.representable.org",
    "representable.org",
    "www.representable-dev.herokuapp.com",
    "representable-dev.herokuapp.com",
]

DEBUG = False

# Production Email Settings
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# Uses default Account Adapter.
# SMTP Server Settings
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
EMAIL_PORT = 587
EMAIL_USE_TLS = True


MIXPANEL_TOKEN = "d0cc0bfda7587bccdb286d10deeac993"

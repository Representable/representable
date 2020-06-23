from .base import *
import os

# https://help.heroku.com/J2R1S4T8/can-heroku-force-an-application-to-use-ssl-tls
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

# only allow requests from domain
ALLOWED_HOSTS = ["www.representable.org", "representable.org"]

DEBUG = False

MIXPANEL_TOKEN = "d0cc0bfda7587bccdb286d10deeac993"

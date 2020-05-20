from .base import *
import os

# https://help.heroku.com/J2R1S4T8/can-heroku-force-an-application-to-use-ssl-tls
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

# only allow requests from domain
ALLOWED_HOSTS = ["www.representable.org", "representable.org"]

DEBUG = False

ACCOUNT_EMAIL_VERIFICATION = "mandatory"
# Can Log In With Either Email or Username
ACCOUNT_AUTHENTICATION_METHOD = "username_email"

ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 7
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
EMAIL_PORT = 587
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = "no-reply@representable.org"

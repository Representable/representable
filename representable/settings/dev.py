from .base import *

ALLOWED_HOSTS = ["*"]

SECURE_SSL_REDIRECT = False

DEBUG = True
# workaround for django all auth
# EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

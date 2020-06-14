from .base import *

ALLOWED_HOSTS = ["*"]

SECURE_SSL_REDIRECT = False

DEBUG = True

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

CORS_ORIGIN_WHITELIST = ("http://localhost:3000",)

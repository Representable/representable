from .base import *
import os

# https://help.heroku.com/J2R1S4T8/can-heroku-force-an-application-to-use-ssl-tls
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"

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

RECAPTCHA_PUBLIC = "6Lcz7BsaAAAAAPZw-gbTKcIoAZcw55QqVxe3PWzz"
RECAPTCHA_PRIVATE = os.getenv("RECAPTCHA_PRIVATE")
CHECK_CAPTCHA_SUBMIT = True

DEBUG_PROPAGATE_EXCEPTIONS = True

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format' : "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
#             'datefmt' : "%d/%b/%Y %H:%M:%S"
#         },
#         'simple': {
#             'format': '%(levelname)s %(message)s'
#         },
#     },
#     'handlers': {
#         'file': {
#             'level': 'DEBUG',
#             'class': 'logging.FileHandler',
#             'filename': 'mysite.log',
#             'formatter': 'verbose'
#         },
#     },
#     'loggers': {
#         'django': {
#             'handlers':['file'],
#             'propagate': True,
#             'level':'DEBUG',
#         },
#         'MYAPP': {
#             'handlers': ['file'],
#             'level': 'DEBUG',
#         },
#     }
# }

ALLOWED_HOSTS = []

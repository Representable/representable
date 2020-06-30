from django.conf import settings
from allauth.account.adapter import DefaultAccountAdapter


class DebugAdapter(DefaultAccountAdapter):
    """
    This class overrides the default Django All-auth account
    adapter by implementing custom functionality.

    This adapter only works in dev.

    Documentation docs: https://django-allauth.readthedocs.io/en/latest/advanced.html#sending-email
    Django Default Adapter Source Code:
    https://github.com/pennersr/django-allauth/blob/master/allauth/account/adapter.py
    """

    def send_mail(self, template_prefix, email, context):
        """
        Overrides the default send_mail method.
        """
        # Use the 'templates/account/email/debug_email_confirmation_*' files instead of the
        # default ones.
        print(template_prefix)
        template_prefix = "account/email/debug_email_confirmation"
        return super().send_mail(template_prefix, email, context)

from django.utils.text import slugify
import uuid
import hashlib


def generate_unique_slug(model, field):
    """
    return unique slug if origin slug is exist.
    eg: `foo-bar` => `foo-bar-1`

    :param `model` is Class model.
    :param `field` is specific field for title.

    Source: https://djangosnippets.org/snippets/10643/
    """
    origin_slug = slugify(field)
    if origin_slug == "":
        origin_slug = "partner"
    unique_slug = origin_slug
    numb = 1
    while model.objects.filter(slug=unique_slug).exists():
        unique_slug = "%s-%d" % (origin_slug, numb)
        numb += 1
    return unique_slug


def generate_unique_token(campaign):
    # adapted from: https://stackoverflow.com/questions/55062799/how-can-i-send-url-with-users-unique-id-and-token-in-django
    salt = uuid.uuid4().hex + campaign
    return hashlib.sha256(salt.encode("utf-8")).hexdigest()

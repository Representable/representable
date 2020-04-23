from django.utils.text import slugify


def generate_unique_slug(model, field):
    """
    return unique slug if origin slug is exist.
    eg: `foo-bar` => `foo-bar-1`

    :param `model` is Class model.
    :param `field` is specific field for title.

    Source: https://djangosnippets.org/snippets/10643/
    """
    origin_slug = slugify(field)
    unique_slug = origin_slug
    numb = 1
    while model.objects.filter(slug=unique_slug).exists():
        unique_slug = "%s-%d" % (origin_slug, numb)
        numb += 1
    return unique_slug

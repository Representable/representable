from django import template

register = template.Library()

@register.filter
def addstr(arg1, arg2):
    """concatenate arg1 & arg2"""
    return str(arg1) + str(arg2)

@register.filter
def get_item(value, key):
    return value[key]

@register.filter
def set_export_name(organization, drive):
    """return drive if it exists"""
    if drive:
        return drive.replace(" ", "_")
    else:
        return organization.replace(" ", "_")

@register.filter
def replace_spaces(arg1):
    return arg1.replace(" ", "_")

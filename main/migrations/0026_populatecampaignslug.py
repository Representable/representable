from django.db import migrations
from main.utils import generate_unique_slug


def gen_slug(apps, schema_editor):
    campaign = apps.get_model("main", "Campaign")
    for row in campaign.objects.all():
        row.slug = generate_unique_slug(campaign, row.name)
        row.save(update_fields=["slug"])


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0025_auto_20200522_0011"),
    ]

    operations = [
        migrations.RunPython(gen_slug, reverse_code=migrations.RunPython.noop),
    ]

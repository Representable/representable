# Generated by Django 2.2.13 on 2020-07-04 06:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0044_auto_20200703_1957"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="membership", name="is_allowlisted",
        ),
        migrations.RemoveField(
            model_name="membership", name="is_org_moderator",
        ),
        migrations.AlterField(
            model_name="membership",
            name="is_org_admin",
            field=models.BooleanField(default=True),
        ),
    ]

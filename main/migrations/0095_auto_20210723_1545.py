# Generated by Django 3.2.4 on 2021-07-23 15:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0094_merge_20210720_2115'),
    ]

    operations = [
        migrations.DeleteModel(
            name='FrequentlyAskedQuestion',
        ),
        migrations.DeleteModel(
            name='GlossaryDefinition',
        ),
    ]
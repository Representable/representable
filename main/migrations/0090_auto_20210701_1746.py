# Generated by Django 2.2.18 on 2021-07-01 17:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0089_organization_logo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organization',
            name='logo',
            field=models.ImageField(blank=True, null=True, upload_to='images/', verbose_name=''),
        ),
    ]
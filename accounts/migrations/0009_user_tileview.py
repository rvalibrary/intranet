# -*- coding: utf-8 -*-
# Generated by Django 1.10.8 on 2018-03-06 22:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_auto_20180103_1550'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='tileview',
            field=models.BooleanField(default=False),
        ),
    ]

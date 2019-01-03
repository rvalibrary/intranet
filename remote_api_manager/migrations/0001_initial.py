# -*- coding: utf-8 -*-
# Generated by Django 1.10.8 on 2017-11-18 17:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='RemoteAPI',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('client_id', models.CharField(max_length=255)),
                ('grant_type', models.CharField(max_length=255)),
                ('client_secret', models.CharField(max_length=500)),
            ],
        ),
    ]
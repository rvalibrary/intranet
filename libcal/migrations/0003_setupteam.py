# -*- coding: utf-8 -*-
# Generated by Django 1.10.8 on 2018-03-18 19:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('libcal', '0002_auto_20171121_1227'),
    ]

    operations = [
        migrations.CreateModel(
            name='SetupTeam',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('team', models.CharField(max_length=100)),
                ('date', models.DateField()),
            ],
        ),
    ]

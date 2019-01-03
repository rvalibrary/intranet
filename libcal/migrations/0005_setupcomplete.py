# -*- coding: utf-8 -*-
# Generated by Django 1.10.8 on 2018-03-22 18:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('libcal', '0004_auto_20180318_2005'),
    ]

    operations = [
        migrations.CreateModel(
            name='SetupComplete',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('book_id', models.CharField(max_length=100)),
                ('date', models.DateField()),
                ('booked', models.BooleanField(default=False)),
            ],
        ),
    ]

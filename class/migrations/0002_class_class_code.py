# Generated by Django 5.1.1 on 2024-10-07 04:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('class', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='class',
            name='class_code',
            field=models.CharField(default=1, max_length=10, unique=True),
            preserve_default=False,
        ),
    ]

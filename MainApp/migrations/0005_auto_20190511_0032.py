# Generated by Django 2.1.4 on 2019-05-10 21:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MainApp', '0004_test2'),
    ]

    operations = [
        migrations.CreateModel(
            name='Test22',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('num', models.IntegerField(default=1)),
                ('task', models.TextField()),
                ('mas', models.TextField()),
                ('trueanswer', models.TextField()),
                ('var1', models.TextField()),
                ('var2', models.TextField()),
                ('var3', models.TextField()),
                ('var4', models.TextField()),
            ],
        ),
        migrations.DeleteModel(
            name='Test2',
        ),
    ]
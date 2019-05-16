from django.db import models
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib import auth
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

# Create your models here.
class Test11(models.Model):
    num = models.IntegerField(default=1)
    task = models.TextField()
    var1 = models.TextField()
    var2 = models.TextField()
    var3 = models.TextField()
    var4 = models.TextField()
    trueanswer = models.TextField()
    date = models.DateField
    def __str__(self):
        return self.task;

    def isdone(self) -> bool:
        myfile = open("MainApp/marks/" +  + ".txt", 'tw', encoding='utf-8')
        strmas = myfile.readlines()
        if(strmas[1][self.num - 1] == '1'):
            return True
        else:
            return False

    def hasmistake(self)  -> bool:
        myfile = open("MainApp/marks/" + User.get_email_field_name() + ".txt", 'tw', encoding='utf-8')
        strmas = myfile.readlines()
        if (strmas[1][self.num - 1] == '2'):
            return True
        else:
            return False

class Test22(models.Model):
        num = models.IntegerField(default=1)
        task = models.TextField()
        mas = models.TextField()
        trueanswer = models.TextField()
        var1 = models.TextField()
        var2 = models.TextField()
        var3 = models.TextField()
        var4 = models.TextField()
        date = models.DateField

        def __str__(self):
            return self.task;

        def isdone(self) -> bool:
            myfile = open("MainApp/marks/" + + ".txt", 'tw', encoding='utf-8')
            strmas = myfile.readlines()
            if (strmas[2][self.num - 1] == '1'):
                return True
            else:
                return False

        def hasmistake(self) -> bool:
            myfile = open("MainApp/marks/" + User.get_email_field_name() + ".txt", 'tw', encoding='utf-8')
            strmas = myfile.readlines()
            if (strmas[2][self.num - 1] == '2'):
                return True
            else:
                return False



from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib import auth
from django.contrib.auth.models import User
from concurrent.futures import ThreadPoolExecutor
import zipfile
import os
from django.views.generic import ListView, DetailView
from MainApp.models import Test11
from MainApp.models import Test22
from django import utils
from django.core import serializers
import  json

# всего задач без графа
N = 100
# всего задач с графом
M = 100
#  request
Req = None
# метод логина
def login(request):
    # проверка вошёл ли уже
    if request.user.is_authenticated:
        return redirect('home')
    # проврека введенного логина и пароля
    data = {'message': ''}
    if request.method == 'POST':
        user_login = request.POST['email']
        user_password = request.POST['password']
        if user_login == '' or user_password == '':
            data['message'] = 'Enter all fields'
        else:
            user = auth.authenticate(username=user_login, password=user_password)
            if user is None:
                data['message'] = 'No such user'
            else:
                auth.login(request, user)
                return redirect('home')
            # рендеринг и возвращение html
    return render(request, 'MainApp/login.html', data)
# метод регистраци
def signup(request):
    # проверка зарегистрирован ли уже
    if request.user.is_authenticated:
        return redirect('home')

    data = {'message': ''}
    # проверяем корректность введенных данных
    if request.method == 'POST':
        user_login = request.POST['email']
        user_password = request.POST['password']
        user_confirm = request.POST['password_confirmation']
        # выводим ошибки
        if user_login == '' or user_password == '' or user_confirm == '':
            data['message'] = 'Enter all fields.'
        elif User.objects.filter(username=user_login).exists():
            data['message'] = 'Such user exists.'
        elif user_password != user_confirm:
            data['message'] = 'Passwords are different.'
        else:
            user = User.objects.create_user(username=user_login, email=user_login, password=user_password)
            user.save()
            user = auth.authenticate(username=user_login, password=user_password)
            auth.login(request, user)
            myfile = open("MainApp/marks/"+request.POST['email']+".txt", 'tw', encoding='utf-8')
            myfile.write(str(0) + "\n")
            for i in range(N):
                myfile.write('0')
            myfile.write("\n")
            for i in range(M):
                myfile.write('0')
            return redirect('login')
        # рендерим сайт и возвращаеем html
    return render(request, 'MainApp/signup.html', data)

# метод принимающий ответы на заданий и проверяяющий их
def home(request):
    # проверка зарегистрирован ли уже
     if not request.user.is_authenticated:
        return redirect('login')
     # выводим все задачи с панели админа
     firsttype = list(Test11.objects.all())
     secondtype = list(Test22.objects.all())
     forgraphjs = list()
     m = len(secondtype)
     # заполняем матрицу смежности для генерации графа в задании
     for r in range(m):
         tost = secondtype[r].mas;
         sptost = secondtype[r].mas.split('\n')
         tostint = [0] * len(sptost)
         for i in range(len(sptost)):
             tostint[i] = [0] * len(sptost)
         g = 0
         h = 0
         for strg in sptost:
             spstr = strg.split(' ')
             h = 0
             for ch in spstr:
                 tostint[g][h] = int(ch)
                 h = h + 1
             g = g + 1
         forgraphjs.insert(len(forgraphjs), tostint)
     #    получаем отет на задние
     if(request.method == "POST"):
         # проверяем провильно ли выполнено задание
         st = str(request.POST.get("ans", ""))
         # проверяем какого типа задание
         if(st != ""):
             mas = st.split(' ')
             h = int(mas[-1])
             display_type = request.POST.get("key", None)
             if display_type == "var1":
                 b = firsttype[h-1].var1
             elif display_type == "var2":
                 b = firsttype[h-1].var2
             elif display_type == "var3":
                 b = firsttype[h-1].var3
             elif display_type == "var4":
                 b = firsttype[h-1].var4
             else:
                 b = 'привет'

             # верно решена задача записываем в файл пользователя результа  1 - верно 2 - неверно
             if(firsttype[h-1].trueanswer == b):
                 myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'r+', encoding='utf-8')
                 str1 = myfile.readlines()
                 if(str1[1][firsttype[h-1].num - 1] != '1'):
                    str1[1] = str1[1][:firsttype[h-1].num - 1] + '1' + str1[1][firsttype[h-1].num:]
                 str1[1].replace('0', '1', 1)
                 myfile.close()
                 with open("MainApp/marks/" + str(request.user.email) + ".txt", 'wb'):
                     pass
                 myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'w', encoding='utf-8')
                 myfile.writelines(str1)
                 redirect('home')
             else:
                 myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'r+', encoding='utf-8')
                 str1 = myfile.readlines()
                 if(str1[1][firsttype[h-1].num-1] != '1'):
                     str1[1] = str1[1][:(firsttype[h-1].num-1)] + "2" + str1[1][firsttype[h-1].num:]
                 myfile.close()
                 with open("MainApp/marks/" + str(request.user.email) + ".txt", 'wb'):
                     pass
                 myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'w', encoding='utf-8')
                 myfile.writelines(str1)
         #          второй тип
         else:
             st = str(request.POST.get("ans2", ""))
             if(st != ""):
                 # проверяем какой вариант
                 mas = st.split(' ')
                 h = int(mas[-1])
                 display_type = request.POST.get("key", None)
                 if display_type == "var1":
                     b = secondtype[h - 1].var1
                 elif display_type == "var2":
                     b = secondtype[h - 1].var2
                 elif display_type == "var3":
                     b = secondtype[h - 1].var3
                 elif display_type == "var4":
                     b = secondtype[h - 1].var4
                 else:
                     b = 'привет'
                 #     сравниваем правильно ли решен
                 if (secondtype[h - 1].trueanswer == b):
                     myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'r+', encoding='utf-8')
                     str1 = myfile.readlines()
                     if (str1[2][secondtype[h - 1].num - 1] != '1'):
                         str1[2] = str1[2][:secondtype[h - 1].num - 1] + '1' + str1[2][secondtype[h - 1].num:]
                     str1[1].replace('0', '1', 1)
                     myfile.close()
                     with open("MainApp/marks/" + str(request.user.email) + ".txt", 'wb'):
                         pass
                     myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'w', encoding='utf-8')
                     myfile.writelines(str1)
                     redirect('home')
                 else:
                     myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'r+', encoding='utf-8')
                     str1 = myfile.readlines()
                     if (str1[2][secondtype[h - 1].num - 1] != '1'):
                         str1[2] = str1[2][:(secondtype[h - 1].num - 1)] + "2" + str1[2][secondtype[h - 1].num:]
                     myfile.close()
                     with open("MainApp/marks/" + str(request.user.email) + ".txt", 'wb'):
                         pass
                     myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'w', encoding='utf-8')
                     myfile.writelines(str1)
     # передаем лист с решенными или нет для выделения фона задний
     Z = request
     myfile = open("MainApp/marks/" + str(request.user.email) + ".txt", 'r', encoding='utf-8')
     strmas = myfile.readlines()
     i = list()
     done2 = list()
     for j in strmas[1] :
         if(j.isdigit()):

                 i.insert(len(i), int(j))

     for j in strmas[2]:
         if (j.isdigit()):
            done2.insert(len(i), int(j))
     l = len(firsttype)
     # массивы для django templates так как нет range
     forfor = list()
     forfor2 = list()
     s = Test11()
     for r in range(l):
         forfor.insert(len(forfor), r)
     for r in range(m):
         forfor2.insert(len(forfor2), r)
     args = {'task1' : firsttype, 'done' : i, 'lenn' : forfor, 'mas' : "", 'task2' : secondtype, 'done2' : done2, 'lenn2' : forfor2, 'mas2' : "",'graphmas' : forgraphjs}
    # рендерим
     return render(request, 'MainApp/home.html', args)

# метод выхода из аккаунта
def logout(request):
    # проверка зарегистрирован ли уже
    if request.user.is_authenticated:
        auth.logout(request)
    return redirect('login')
#  метод вызова калькулятора
def calc(request):
    # проверка зарегистрирован ли уже
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'MainApp/calc.html')
# метод генерации рандомного графа для самостоятельного прорешивания
def rand(request, num="9", source="1", sink="1"):
    # проверка зарегистрирован ли уже
    if not request.user.is_authenticated:
        return redirect('login')
    args = {'num' : num, 'source' : source, 'sink' : sink}
    return render(request, 'MainApp/rand.html', args)
# метод для вывода теории
def theor(request):
    # проверка зарегистрирован ли уже
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'MainApp/theor.html')

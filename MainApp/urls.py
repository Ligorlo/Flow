from django.conf.urls import url
from MainApp import views
from django.contrib import admin
from django.urls import path
from django.views.generic import ListView, DetailView
urlpatterns = [
    url(r'admin/', admin.site.urls),
    url(r'^$', views.login, name='login'),
    url(r'^login', views.login, name='login'),
    url(r'^signup', views.signup, name='signup'),
    url(r'^home', views.home, name='home'),
    url(r'^logout', views.logout, name='logout'),
    url(r'^calc', views.calc, name='calc'),
    url(r'^rand/(?P<num>[0-9]+)/(?P<source>[0-9]+)/(?P<sink>[0-9]+)', views.rand, name='rand'),
    url(r'^theor', views.theor, name='theor'),
]


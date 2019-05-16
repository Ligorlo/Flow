from django.template import Library
from MainApp.models import Test11

register = Library()

def index(var, args):
    return var[args]

register.filter(index)
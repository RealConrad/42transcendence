from django.urls import path
from . import views

urlpatterns = [
    path('setup_2fa/', views.two_factor_setup, name='setup_2fa'),
]
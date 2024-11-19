from django.urls import path
from . import views

urlpatterns = [
    path('enable_2fa', views.enable_2fa, name='enable_2fa'),
    path('verify_2fa/', views.verify_2fa, name='verify_2fa'),
    path('disable_2fa/', views.disable_2fa, name='disable_2fa'),
]
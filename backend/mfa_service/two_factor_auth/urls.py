from django.urls import path
from . import views
from .views import Verify2FAView

urlpatterns = [
    path('enable/', views.enable_2fa, name='enable'),
    path('verify/', Verify2FAView.as_view(), name='verify'),
    path('disable/', views.disable_2fa, name='disable'),
]
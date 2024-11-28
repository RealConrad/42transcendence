from django.urls import path
from . import views
from .views import Verify2FAView, Enable2FAView, Disable2FAView

urlpatterns = [
    path('enable/', Enable2FAView.as_view(), name='enable'),
    path('verify/', Verify2FAView.as_view(), name='verify'),
    path('disable/', Disable2FAView.as_view(), name='disable'),
]
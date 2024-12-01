from django.urls import path
from .views import VerifyOAuthTokenView, RefreshOAuthTokenView

urlpatterns = [
    path('verify/', VerifyOAuthTokenView.as_view(), name='verify_token'),
    path('refresh/', RefreshOAuthTokenView.as_view(), name='refresh_token'),
]


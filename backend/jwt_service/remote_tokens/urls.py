from django.urls import path
from .views import VerifyOAuthTokenView, RefreshOAuthTokenView, OAuthLogoutView

urlpatterns = [
    path('verify/', VerifyOAuthTokenView.as_view(), name='verify_token'),
    path('refresh/', RefreshOAuthTokenView.as_view(), name='refresh_token'),
    path('logout/', OAuthLogoutView.as_view(), name='logout'),
]


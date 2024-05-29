from django.urls import path
from .views import RegisterView, LoginView, DeleteUserView, CustomTokenRefreshView

urlpatterns = [
	path('register/', RegisterView.as_view(), name='register'),
	path('login/', LoginView.as_view(), name='login'),
	path('delete/', DeleteUserView.as_view(), name='delete'),
	path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
]

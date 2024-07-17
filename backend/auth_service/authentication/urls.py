from django.urls import path
from .views import RegisterView, LoginView, DeleteUserView, CustomTokenRefreshView, CustomTokenVerifyView
from rest_framework_simplejwt.views import (
	TokenVerifyView,
)

urlpatterns = [
	path('register/', RegisterView.as_view(), name='register'),
	path('login/', LoginView.as_view(), name='login'),
	path('delete/', DeleteUserView.as_view(), name='delete'),
	# path('token/pair/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
	path('token/verify/', CustomTokenVerifyView.as_view(), name='token_verify'),
]

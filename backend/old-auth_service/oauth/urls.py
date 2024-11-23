from django.urls import path
from .views import oauthLogin, oauthCallback

urlpatterns = [
	path('oauth-login/', oauthLogin, name='oauth-login'),
	path('oauth-callback/', oauthCallback, name='oauth-callback'),
]

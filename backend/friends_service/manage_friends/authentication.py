import requests
from django.contrib.auth.models import User
from .models import Friendship, UserProfile
from rest_framework import exceptions, authentication

AUTH_SERVICE_URL = "http://authservice:8000/api/auth/check_user_existence/"

class JWTAuthentication(authentication.BaseAuthentication):
    """
    Custom JWT Authentication class to authenticate user via header Bearer token
    """
    JWT = "JWT"
    OAUTH = "OAUTH"

    def authenticate(self, request):
        if request.headers.get('X-42-Token'):
            return self.authenticate_with_oauth_token(request)

        access_token = self.get_authorization_token(request)
        token_data = self.validate_token_with_service(access_token, self.JWT)

        username = token_data.get("username")

        user, created = User.objects.get_or_create(username=username)
        UserProfile.objects.get_or_create(user=user)
        request.token_data = token_data
        return user, None

    def authenticate_with_oauth_token(self, request):
        access_token = self.get_authorization_token(request)

        token_data = self.validate_token_with_service(access_token, self.OAUTH)
        username = token_data.get("username")
        user, created = User.objects.get_or_create(username=username)
        UserProfile.objects.get_or_create(user=user)
        request.token_data = token_data
        return user, None

    def validate_token_with_service(self, access_token, auth_method):
        """
        Validate the provided token with the JWT service and return token data.
        """
        auth_service_url = {
            self.JWT: "http://jwtservice:8002/api/token/verify/",
            self.OAUTH: "http://jwtservice:8002/api/oauth_token/verify/"
        }.get(auth_method)


        try:
            response = requests.post(auth_service_url, json={'token': access_token})
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 401:
                raise exceptions.AuthenticationFailed("Invalid or expired token")
            else:
                raise exceptions.AuthenticationFailed("Token verification failed")
        except requests.exceptions.RequestException as e:
            raise exceptions.AuthenticationFailed(f"Auth service unavailable: {str(e)}")


    @staticmethod
    def get_authorization_token(request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise exceptions.AuthenticationFailed("Authorization header is missing")

        if not auth_header.startswith('Bearer '):
            raise exceptions.AuthenticationFailed("Invalid token header")

        access_token = auth_header.split(" ")[1]
        return access_token

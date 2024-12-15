import requests
from django.contrib.auth import get_user_model
from rest_framework import exceptions, authentication


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

        user_model = get_user_model()
        user = user_model.objects.get(username=username)
        if not user:
            raise exceptions.AuthenticationFailed("User not found")
        return user, None

    def validate_token_with_service(self, access_token, auth_method):
        """
        Validate the provided token with the JWT service and return token data.
        """
        match auth_method:
            case self.JWT:
                auth_service_url = "http://jwtservice:8002/api/token/verify/"
            case self.OAUTH:
                auth_service_url = "http://jwtservice:8002/api/oauth_token/verify/"
            case _:
                raise ValueError(f"Unsupported authMethod: {auth_method}")

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

    def authenticate_with_oauth_token(self, request):
        access_token = self.get_authorization_token(request)

        token_data = self.validate_token_with_service(access_token, self.OAUTH)
        username = token_data.get("username")

        user_model = get_user_model()
        user = user_model.objects.get(username=username)
        if not user:
            raise exceptions.AuthenticationFailed("User not found")
        return user, None

    @staticmethod
    def get_authorization_token(request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise exceptions.AuthenticationFailed("Authorization header is missing")

        if not auth_header.startswith('Bearer '):
            raise exceptions.AuthenticationFailed("Invalid token header")

        access_token = auth_header.split(" ")[1]
        return access_token
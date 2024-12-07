import requests
from django.contrib.auth.models import User
from django.apps import apps
from match.models import UserProfile
from types import SimpleNamespace
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions, authentication

class CustomJWTAuthentication(authentication.BaseAuthentication):
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
        user_id = token_data.get("user_id")

        user, created = User.objects.get_or_create(
            id=user_id,
            username=username
        )
        UserProfile.objects.get_or_create(user=user)
        request.token_data = token_data
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

        user, created = User.objects.get_or_create(
            username=username
        )
        UserProfile.objects.get_or_create(user=user)
        request.token_data = token_data
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


# JWT_SERVICE_URL = "http://jwtservice:8002/api/token/verify/"
#
# class CustomJWTAuthentication(BaseAuthentication):
#     def authenticate(self, request):
#         auth_header = request.headers.get("Authorization")
#         print(f"{auth_header}")
#         if not auth_header or not auth_header.startswith("Bearer "):
#             raise AuthenticationFailed("Authorization header is missing or invalid")
#
#         token = auth_header.split(" ")[1] # Extract the token from the header
#         print(f"TOKEN: {token}")
#         try:
#             jwt_response = requests.post(
#                 JWT_SERVICE_URL,
#                 json={"token": token}
#             )
#             print(f"JWT Service Response: {jwt_response.status_code}, {jwt_response.text}")
#             if jwt_response.status_code != 200:
#                 raise AuthenticationFailed("Invalid or expired token")
#
#             decoded_token = jwt_response.json()
#             user_id = decoded_token.get("user_id")
#             if not user_id:
#                 raise AuthenticationFailed("Invalid token payload")
#             return SimpleNamespace(id=user_id, is_authenticated=True), None
#         except requests.RequestException:
#             raise AuthenticationFailed("Unable to validate token with JWT service")

# JWT_SERVICE_URL = 'http://localhost:8002/api/token'
#
# class CustomJWTAuthentication(BaseAuthentication):
#     def authenticate(self, request):
#         access_token = request.COOKIES.get('access_token')
#         refresh_token = request.COOKIES.get('refresh_token')
#
#         if not access_token:
#             raise AuthenticationFailed('Access token is missing')
#
#         user_id = self._validate_access_token(access_token)
#         if user_id:
#             # Token is valid
#             print("Access token is valid")
#             return SimpleNamespace(id=user_id, is_authenticated=True), None
#         else:
#             # Try to refresh the access token
#             print("Trying to refresh token...")
#             if refresh_token:
#                 new_access_token, new_refresh_token = self._refresh_access_token(refresh_token)
#                 if new_access_token:
#                     # Update tokens in cookies via middleware
#                     request._request.new_access_token = new_access_token
#                     request._request.new_refresh_token = new_refresh_token
#                     # Retry validation with the new access token
#                     user_id = self._validate_access_token(new_access_token)
#                     if user_id:
#                         return SimpleNamespace(id=user_id, is_authenticated=True), None
#             # If unable to validate or refresh, raise an error
#             raise AuthenticationFailed('Invalid or expired tokens')
#
#     def _validate_access_token(self, token):
#         try:
#             jwt_response = requests.post(
#                 f'{JWT_SERVICE_URL}/verify-token/',
#                 json={'token': token}
#             )
#             if jwt_response.status_code == 200:
#                 data = jwt_response.json()
#                 return data.get('user_id')
#             else:
#                 return None
#         except requests.RequestException:
#             raise AuthenticationFailed('JWT service is unavailable')
#
#     def _refresh_access_token(self, refresh_token):
#         try:
#             jwt_response = requests.post(
#                 f'{JWT_SERVICE_URL}/refresh-token/',
#                 json={'refresh_token': refresh_token}
#             )
#             if jwt_response.status_code == 200:
#                 data = jwt_response.json()
#                 new_access_token = data.get('access_token')
#                 new_refresh_token = data.get('refresh_token')
#                 return new_access_token, new_refresh_token
#             else:
#                 return None, None
#         except requests.RequestException:
#             raise AuthenticationFailed('JWT service is unavailable')

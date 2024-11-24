import requests
from django.shortcuts import redirect
from types import SimpleNamespace
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication


JWT_SERVICE_URL = "http://jwtservice:8002/api/token/verify/"

class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        print(f"{auth_header}")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise AuthenticationFailed("Authorization header is missing or invalid")

        token = auth_header.split(" ")[1] # Extract the token from the header
        print(f"TOKEN: {token}")
        try:
            jwt_response = requests.post(
                JWT_SERVICE_URL,
                json={"token": token}
            )
            print(f"JWT Service Response: {jwt_response.status_code}, {jwt_response.text}")
            if jwt_response.status_code != 200:
                raise AuthenticationFailed("Invalid or expired token")

            decoded_token = jwt_response.json()
            user_id = decoded_token.get("user_id")
            if not user_id:
                raise AuthenticationFailed("Invalid token payload")
            return SimpleNamespace(id=user_id, is_authenticated=True), None
        except requests.RequestException:
            raise AuthenticationFailed("Unable to validate token with JWT service")

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

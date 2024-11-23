import requests
from django.shortcuts import redirect
from types import SimpleNamespace
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication

JWT_SERVICE_URL = 'http://localhost:8002/api/token'


class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')

        if not access_token:
            raise AuthenticationFailed('Access token is missing')

        user_id = self._validate_access_token(access_token)
        if user_id:
            # Token is valid
            return SimpleNamespace(id=user_id), None
        else:
            # Try to refresh the access token
            if refresh_token:
                new_access_token = self._refresh_access_token(refresh_token)
                if new_access_token:
                    # Update the access_token in cookies via middleware
                    request.new_access_token = new_access_token
                    # Retry validation with the new access token
                    user_id = self._validate_access_token(new_access_token)
                    if user_id:
                        return SimpleNamespace(id=user_id), None
            # If unable to validate or refresh, raise an error
            raise AuthenticationFailed('Invalid or expired tokens')

    def _validate_access_token(self, token):
        try:
            jwt_response = requests.post(
                f'{JWT_SERVICE_URL}/verify-token/',
                json={'token': token}
            )
            if jwt_response.status_code == 200:
                data = jwt_response.json()
                return data.get('user_id')
            else:
                return None
        except requests.RequestException:
            raise AuthenticationFailed('JWT service is unavailable')

    def _refresh_access_token(self, refresh_token):
        try:
            jwt_response = requests.post(
                f'{JWT_SERVICE_URL}/refresh-token/',
                json={'refresh_token': refresh_token}
            )
            if jwt_response.status_code == 200:
                data = jwt_response.json()
                return data.get('access_token')
            else:
                return None
        except requests.RequestException:
            raise AuthenticationFailed('JWT service is unavailable')
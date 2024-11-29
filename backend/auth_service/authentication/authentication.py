import requests
from django.contrib.auth import get_user_model
from rest_framework import exceptions, authentication


class JWTAuthentication(authentication.BaseAuthentication):
    """
    Custom JWT Authentication class to authenticate user via header Bearer token
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise exceptions.AuthenticationFailed("Authorization header is missing")

        if not auth_header.startswith('Bearer '):
            raise exceptions.AuthenticationFailed("Invalid token header")

        access_token = auth_header.split(" ")[1]

        auth_service_url = "http://jwtservice:8002/api/token/verify/"

        try:
            response = requests.post(auth_service_url, json={'token': access_token})
            if response.status_code == 200:
                token_data = response.json()
                request.token_data = token_data

                # Fetch the user based on its id returns by JWT service
                user_model = get_user_model()
                user = user_model.objects.filter(id=token_data.get("user_id")).first()
                if not user:
                    raise exceptions.AuthenticationFailed("User not found")
                return user, None
            else:
                raise exceptions.AuthenticationFailed("Invalid Token")
        except requests.exceptions.RequestException as e:
            raise exceptions.AuthenticationFailed(f"Auth service unavailable: {str(e)}")
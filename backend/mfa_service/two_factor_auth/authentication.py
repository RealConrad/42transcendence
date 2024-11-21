import jwt
from django.conf import settings
from django.contrib.auth.models import User
from .models import UserProfile
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

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])

            user_id = payload.get('user_id')
            username = payload.get('username')
            if not user_id:
                raise exceptions.AuthenticationFailed("Invalid token header; user_id missing")

            user, created = User.objects.get_or_create(
                id=user_id,
                username=username
            )
            request.jwt_payload = payload
            UserProfile.objects.get_or_create(user=user)
            return user, None

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")

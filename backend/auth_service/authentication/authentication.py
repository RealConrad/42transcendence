from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken, TokenError

class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')

        if not access_token:
            raise exceptions.AuthenticationFailed('Authentication credentials were not provided.')

        try:
            # Validate access token
            validated_access_token = AccessToken(access_token)
            user = self.get_user_from_token(validated_access_token)
            return (user, validated_access_token)
        except TokenError:
            # Access token is invalid or expired
            if not refresh_token:
                raise exceptions.AuthenticationFailed('Refresh token not provided.')

            try:
                # Attempt to refresh the access token
                new_access_token = self.refresh_access_token(refresh_token)
                # Attach the new access token to the request for middleware to set the cookie
                request._new_access_token = new_access_token
                # Validate the new access token
                validated_access_token = AccessToken(new_access_token)
                user = self.get_user_from_token(validated_access_token)
                return (user, validated_access_token)
            except TokenError:
                # Refresh token is invalid or expired
                raise exceptions.AuthenticationFailed('Authentication credentials expired.')

    def get_user_from_token(self, token):
        user_id = token.get('user_id')
        username = token.get('username')
        # Create a user object or use your user model
        from types import SimpleNamespace
        user = SimpleNamespace(id=user_id, username=username, is_authenticated=True)
        return user

    def refresh_access_token(self, refresh_token):
        refresh = RefreshToken(refresh_token)
        new_access_token = refresh.access_token
        return str(new_access_token)

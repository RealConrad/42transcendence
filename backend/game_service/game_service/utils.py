import requests
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings


def verify_token_with_auth_service(token):
    try:
        response = requests.post(
            f"{settings.AUTH_SERVICE_URL}/api/auth/token/verify/",
            data={"token": token}
        )
        if response.status_code == 200:
            return response.json()
        else:
            raise AuthenticationFailed("Invalid token")
    except Exception as e:
        raise AuthenticationFailed("Token verification failed: " + str(e))

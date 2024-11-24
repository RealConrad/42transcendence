from rest_framework.permissions import BasePermission
import requests

import logging

logger = logging.getLogger(__name__)


class IsAuthenticatedFromAuthService(BasePermission):
    def has_permission(self, request, view):
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return False

        auth_service_url = "http://authservice:8000/api/auth/token/verify/"
        try:
            response = requests.post(auth_service_url, json={"token": access_token})
            if response.status_code == 200:
                token_data = response.json()
                request.username = token_data.get("username")
                request.user_id = token_data.get("user_id")
                return True
            else:
                return False
        except requests.RequestException as e:
            return False
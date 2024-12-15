import logging
from datetime import datetime, timezone
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

class RefreshTokensMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    # Code to be executed before each request
    def __call__(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        access_token = request.COOKIES.get('access_token')
        if refresh_token and access_token:
            try:
                access = RefreshToken(refresh_token).access_token
                if datetime.now(timezone.utc) >= datetime.fromtimestamp(access['exp'], timezone.utc):
                    new_refresh = RefreshToken(refresh_token)
                    new_access = new_refresh.access_token
                    new_access['username'] = access_token['username']
                    new_access['user_id'] = access_token['user_id']
                    response = self.get_response(request)
                    response.set_cookie(
                        key='access_token',
                        value=str(new_access),
                        httponly=True,
                        secure=True,
                        samesite='None'
                    )
                    response.set_cookie(
                        key='refresh_token',
                        value=str(new_refresh),
                        httponly=True,
                        secure=True,
                        samesite='None'
                    )
                    return response
            except Exception as e:
                return JsonResponse({"error": f"Invalid token or expired: {e}"})
        response = self.get_response(request)
        return response
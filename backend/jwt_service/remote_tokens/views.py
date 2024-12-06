import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .utils import fetch_user_info, refresh_access_token

# Create your views here.

class VerifyOAuthTokenView(APIView):
    """
    Verifies 42 OAuth generated access token
    """

    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get('token')
        if not access_token:
            return Response(
                {'detail': 'access token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )


        try:
            user_info = fetch_user_info(access_token)
            return Response(
                {'valid': True,
                 'username': user_info.get('login'),
                 },
                status=status.HTTP_200_OK
            )
        except requests.exceptions.HTTPError:
            return Response(
                {'valid': False, 'detail': 'Invalid or expired token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {'detail': f"Error verifying token: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )



class RefreshOAuthTokenView(APIView):
    """
    Exchanges the 42 OAuth refresh token for a new access token
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_tokens = refresh_access_token(refresh_token)
            new_access_token = new_tokens.get('access_token')
            new_refresh_token = new_tokens.get('refresh_token')
            response = Response({
                'detail': 'access token refreshed',
                'access_token': new_access_token,
                'refresh_tokn': new_refresh_token,
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key='refresh_token',
                value=new_refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax'
            )

            return response
        except requests.exceptions.HTTPError:
            return Response(
                {'detail': 'Failed to refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {'detail': f"Error refreshing token: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
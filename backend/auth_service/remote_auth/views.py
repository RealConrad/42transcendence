import requests
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from .helpers import (
    authorize_url,
    create_user_from_token_data,
)

# Create your views here.

class AuthorizeAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        authorization_url = {'location': authorize_url()}
        response = JsonResponse(authorization_url)
        return response


class CallbackAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        state = request.data.get('state')

        if not code and not state:
            return Response(
                {'detail': "Missing 'code' or 'sate' parameter"},
                status=HTTP_400_BAD_REQUEST
            )

        if state != settings.STATE:
            return Response(
                {'detail': "Invalid 'state' parameter"},
                status=HTTP_400_BAD_REQUEST
            )

        token_url = "https://api.intra.42.fr/oauth/token"
        data = {
            "grant_type": "authorization_code",
            "client_id": settings.CLIENT_ID,
            "client_secret": settings.CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.REDIRECT_URI,
            "state": settings.STATE
        }

        try:
            token_response = requests.post(token_url, data=data)
            if token_response.status_code == 200:
                token_data = token_response.json()
                user = create_user_from_token_data(token_data)
                access_token = token_data.get('access_token')
                refresh_token = token_data.get('refresh_token')

                response = Response(
                    {
                        'detail': "User logged in successfully",
                        'username': user.username,
                        'profile_picture': user.profile_picture_url,
                        'access_token': access_token,
                        'refresh_token': refresh_token,
                    },
                    status=HTTP_200_OK
                )

                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=False,
                    samesite='Lax',
                )
                return  response
            else:
                return Response(
                    {'detail': 'Failed to fetch user data from 42 API'},
                    status=HTTP_400_BAD_REQUEST)

        except requests.HTTPError as http_err:
            return Response(
                {'detail': 'Failed to exchange code for token'},
                status=HTTP_400_BAD_REQUEST
            )

        except Exception as exc:
            return Response(
                {'detail': f"Internal server error: {str(exc)}"},
                status=HTTP_500_INTERNAL_SERVER_ERROR
            )
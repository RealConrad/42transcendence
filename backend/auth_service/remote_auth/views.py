import requests
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK, HTTP_500_INTERNAL_SERVER_ERROR
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
from .helpers import (
    authorize_url,
    create_user_from_token_data,
)
from rest_framework import serializers
# Create your views here.

FRIENDS_SERVICE_URl = 'http://friendsservice:8004/api/friends/update-profile-pic-url/'

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
            token_response.raise_for_status()
            token_data = token_response.json()

            user = create_user_from_token_data(token_data)
            access_token = token_data.get('access_token')
            refresh_token = token_data.get('refresh_token')

            self.update_friends_service(request, user.profile_picture_url, access_token)

            response = Response(
                {
                    'detail': "User logged in successfully",
                    'username': user.username,
                    'profile_picture': user.profile_picture_url,
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'displayname': user.displayname,
                    'mfa_enable_flag': user.mfa_enabled
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

        except serializers.ValidationError as e:
            return Response({"detail": e.detail}, status=400)

        except requests.HTTPError as e:
            return Response({"detail": f"Token exchange failed: {str(e)}"}, status=400)

        except Exception as e:
            return Response(
                {'detail': f"Internal server error: {str(e)}"},
                status=HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update_friends_service(self, request, profile_picture_url, access_token):
        """
        Updates profile picture url in the friends service
        """

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
            "X-42-Token": "true"
        }

        payload = {
            "profile_picture_url": profile_picture_url,
        }

        response = requests.put(FRIENDS_SERVICE_URl, json=payload, headers=headers)
        response.raise_for_status()
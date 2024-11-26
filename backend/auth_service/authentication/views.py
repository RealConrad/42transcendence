import requests
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK

from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer

JWT_SERVICE_URL = 'http://jwtservice:8002/api/token/generate-tokens/'

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Request tokens from JWT service
            jwt_response = requests.post(
                JWT_SERVICE_URL,
                json={'user_id': user.id, 'username': user.username}
            )

            if jwt_response.status_code == 200:
                tokens = jwt_response.json()
                access_token = tokens.get('access_token')
                refresh_token = tokens.get('refresh_token')

                response = Response({
                    "detail": "User registered successfully",
                    "username": user.username,
                    "user_id": user.id,
                    "access_token": access_token
                }, status=status.HTTP_201_CREATED)

                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=False,
                    samesite='Lax',
                )
                return response
            else:
                return Response({'detail': 'Failed to obtain tokens from JWT service'},
                                status=jwt_response.status_code)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']

            # Request tokens from JWT service
            jwt_response = requests.post(
                JWT_SERVICE_URL,
                json={'user_id': user.id, 'username': user.username}
            )

            if jwt_response.status_code == 200:
                tokens = jwt_response.json()
                access_token = tokens.get('access_token')
                refresh_token = tokens.get('refresh_token')

                response = Response({
                    "detail": "User logged in successfully",
                    "username": user.username,
                    "user_id": user.id,
                    "access_token": access_token,
                    "mfa_enable_flag": user.mfa_enabled,
                }, status=status.HTTP_200_OK)

                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=False,
                    samesite='Lax',
                )
                return response
            else:
                return Response({'detail': 'Failed to obtain tokens from JWT service'},
                                status=jwt_response.status_code)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SetMFAFlagView(generics.GenericAPIView):
    """
    Generic view to update the MFA flag for a user
    """
    permission_classes = [AllowAny]

    def put(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        username = request.data.get('username')
        mfa_enabled = request.data.get('mfa_enabled')

        if mfa_enabled is None:
            return Response(
                {'detail': 'mfa_enabled flag is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(id=user_id, username=username)
        except CustomUser.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.mfa_enabled = mfa_enabled
        user.save()

        flag_status = "enabled" if mfa_enabled else "disabled"
        return Response(
            {'detail': f'MFA flag set to {flag_status}'},
            status=status.HTTP_200_OK
        )

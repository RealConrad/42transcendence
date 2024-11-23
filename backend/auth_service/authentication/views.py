import requests
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
from .serializers import RegisterSerializer, LoginSerializer

JWT_SERVICE_URL = 'http://localhost:8002/api/token/generate-tokens/'

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
                json={'user_id': user.id}
            )

            if jwt_response.status_code == 200:
                tokens = jwt_response.json()
                access_token = tokens.get('access_token')
                refresh_token = tokens.get('refresh_token')

                response = Response({
                    "detail": "User registered successfully",
                    "username": user.username,
                    "user_id": user.id,
                }, status=status.HTTP_201_CREATED)

                # Set tokens in cookies
                response.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True,
                    secure=False,  # Set to True in production
                    samesite='Lax',
                )
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=False,  # Set to True in production
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
                json={'user_id': user.id}
            )

            if jwt_response.status_code == 200:
                tokens = jwt_response.json()
                access_token = tokens.get('access_token')
                refresh_token = tokens.get('refresh_token')

                response = Response({
                    "detail": "User logged in successfully",
                    "username": user.username,
                    "user_id": user.id,
                }, status=status.HTTP_200_OK)

                # Set tokens in cookies
                response.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True,
                    secure=False,  # Set to True in production
                    samesite='Lax',
                )
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=False,  # Set to True in production
                    samesite='Lax',
                )
                return response
            else:
                return Response({'detail': 'Failed to obtain tokens from JWT service'},
                                status=jwt_response.status_code)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


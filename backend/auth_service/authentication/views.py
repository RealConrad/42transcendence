from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    CustomTokenObtainPairSerializer,
    CustomTokenVerifySerializer
)

"""
In Django REST Framework (DRF), the views generally return a Response object instead of the standard Django HttpResponse.
The Response object provided by DRF is specifically designed to return content that will be rendered into
JSON or another content type
"""


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenVerifyView(TokenVerifyView):
    serializer_class = CustomTokenVerifySerializer


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"error": "Refresh token is missing"}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)

        # Return the new access token
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    # These variables are used by the parent class 'generics.CreateAPIView'
    queryset = User.objects.all()  # Define the queryset for the view
    permission_classes = (permissions.AllowAny,)  # Set permission for the view
    serializer_class = RegisterSerializer  # Set the serializer class for the view

    # overrides the default behavior to provide a custom response.
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)  # Uses serializer_class

        # Validate if the user credentials, this will return error codes
        serializer.is_valid(raise_exception=True)

        user = serializer.save()  # Save the user
        refresh = CustomTokenObtainPairSerializer.get_token(user)  # Generates JWT tokens
        access_token = str(refresh.access_token)

        response = Response({
            "user": {
                "user_id": user.id,
                "username": user.username,
            },
            "access": access_token,
            "message": "Created new user"
        }, status=status.HTTP_201_CREATED)

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Strict",
        )
        return response


class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        access_token = str(refresh.access_token)

        response = Response({
            'access': access_token,
            'user': {
                'user_id': user.id,
                'username': user.username,
            }
        }, status=status.HTTP_200_OK)

        # Set the refresh token in an HTTP-only cookie
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=False,  # TODO: Use True in production with HTTPS
            samesite='Strict',
        )

        return response


class DeleteUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, format=None):
        user = request.user
        user.delete()
        return Response({
            'message': "User has been deleted"
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            response = Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
            response.delete_cookie("refresh_token")
            return response

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
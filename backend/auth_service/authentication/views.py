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
    serializer_class = CustomTokenObtainPairSerializer


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
        return Response({
            "user": {
                "user_id": user.id,
                "username": user.username,
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "message": "Created new user"
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'user_id': user.id,
                'username': user.username,
            }
        }, status=status.HTTP_200_OK)


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
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
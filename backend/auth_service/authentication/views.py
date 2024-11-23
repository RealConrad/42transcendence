from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.http import JsonResponse
from rest_framework.permissions import AllowAny


class TokenRefreshView(APIView):
    @staticmethod
    def post(request):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token is None:
            return JsonResponse({"detail": "Refresh token not provided."}, status=400)
        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = refresh.access_token
            response = JsonResponse({"detail": "Token refreshed successfully."}, status=200)
            response.set_cookie(
                key='access_token',
                value=str(new_access_token),
                httponly=True,
                secure=False,
                samesite='Lax',
            )
            return response
        except TokenError as e:
            return JsonResponse({"detail": "Invalid refresh token."}, status=401)


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            response = Response({
                "detail": "User registered successfully",
                "username": user.username,
                "user_id": user.id,
                "access": str(access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_201_CREATED)

            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token

                response = Response({
                    "detail": "User logged in",
                    "username": user.username,
                    "user_id": user.id,
                    "access": str(access_token),
                    "refresh": str(refresh),
                }, status=status.HTTP_200_OK)
                return response
            else:
                return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

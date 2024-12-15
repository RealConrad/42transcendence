from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import AllowAny
from rest_framework import status

class GenerateTokensView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        username = request.data.get('username')
        if not user_id and username:
            return Response({'detail': 'Unable to create tokens'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate tokens
        refresh = RefreshToken()
        refresh['user_id'] = user_id
        refresh['username'] = username
        access_token = refresh.access_token
        access_token['user_id'] = user_id
        access_token['username'] = username
        return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh),
        }, status=status.HTTP_200_OK)

class VerifyTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'detail': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            username = access_token['username']
            return Response({
                'valid': True,
                'user_id': user_id,
                'username': username
            }, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'valid': False, 'detail': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'detail': 'Refresh token is required'}, status=400)

        try:
            refresh = RefreshToken(refresh_token)
            user_id = refresh['user_id']
            username = refresh['username']
            refresh.blacklist()

            # Create a new refresh token
            new_refresh = RefreshToken()
            new_refresh['user_id'] = user_id
            new_refresh['username'] = username
            new_access_token = new_refresh.access_token
            new_access_token['user_id'] = user_id
            new_access_token['username'] = username
            response = Response({
                'access_token': str(new_access_token),
            }, status=status.HTTP_200_OK)
            response.set_cookie(
                key='refresh_token',
                value=new_refresh,
                httponly=True,
                secure=True,
                samesite='None'
            )
            return response
        except TokenError:
            return Response({'detail': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"detail": "Refresh token is missing"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        response = Response({"detail": "Successfully logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response
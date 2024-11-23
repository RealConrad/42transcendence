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
        if not user_id:
            return Response({'detail': 'Unable to create tokens'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate tokens
        refresh = RefreshToken()
        refresh['user_id'] = user_id
        access_token = refresh.access_token
        access_token['user_id'] = user_id
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
            return Response({'valid': True, 'user_id': user_id}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'valid': False, 'detail': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({'detail': 'Refresh token is required'}, status=400)

        try:
            refresh = RefreshToken(refresh_token)
            user_id = refresh['user_id']
            refresh.blacklist()

            # Create a new refresh token
            new_refresh = RefreshToken()
            new_refresh['user_id'] = user_id
            new_access_token = new_refresh.access_token
            new_access_token['user_id'] = user_id
            return Response({
                'access_token': str(new_access_token),
                'refresh_token': str(new_refresh),
            }, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'detail': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
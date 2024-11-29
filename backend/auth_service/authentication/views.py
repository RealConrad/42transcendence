import requests
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer
from .authentication import JWTAuthentication

JWT_SERVICE_URL = 'http://jwtservice:8002/api/token/generate-tokens/'
JWT_VERIFY_URL = 'http://jwtservice:8002/api/token/verify/'

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


class SaveProfilePicture(generics.GenericAPIView):
    """
    Generic view to store user profile picture
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        user = request.user

        # Saving the file
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response(
                {'detail': "No File uploaded"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # renaming and saving the file
        file_name = f"{user.id}_{uploaded_file.name}"
        user.profile_picture.save(file_name, uploaded_file)
        user.save()

        return Response(
            {'detail': "Profile picture uploaded successfully"},
            status=status.HTTP_200_OK
        )
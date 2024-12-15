import requests
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer, UpdateDisplayNameSerializer
from .authentication import JWTAuthentication

JWT_SERVICE_URL = 'http://jwtservice:8002/api/token/generate-tokens/'
JWT_VERIFY_URL = 'http://jwtservice:8002/api/token/verify/'
FRIENDS_SERVICE_URl = 'http://friendsservice:8004/api/friends/update-profile-pic-url/'

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

                user.logged_in = True
                user.save()

                response = Response({
                    "detail": "User registered successfully",
                    "username": user.username,
                    "user_id": user.id,
                    "access_token": access_token,
                    "displayname": user.displayname
                }, status=status.HTTP_201_CREATED)

                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=True,
                    samesite='None',
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

                profile_picture_url = (
                    request.build_absolute_uri(user.profile_picture.url)
                    if user.profile_picture and hasattr(user.profile_picture, 'url')
                    else None
                )

                user.logged_in = True
                user.save()

                response = Response({
                    "detail": "User logged in successfully",
                    "username": user.username,
                    "user_id": user.id,
                    "access_token": access_token,
                    "mfa_enable_flag": user.mfa_enabled,
                    "logged_in": user.logged_in,
                    "profile_picture": profile_picture_url,
                    "displayname": user.displayname
                }, status=status.HTTP_200_OK)

                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=True,
                    samesite='None',
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
        username = request.data.get('username')
        mfa_enabled = request.data.get('mfa_enabled')

        if mfa_enabled is None:
            return Response(
                {'detail': 'mfa_enabled flag is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(username=username)
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

        profile_picture_url = (
            request.build_absolute_uri(user.profile_picture.url)
            if user.profile_picture and hasattr(user.profile_picture, 'url')
            else None
        )

        user.profile_picture_url = profile_picture_url
        user.save()

        self.update_friends_service(request, profile_picture_url)

        return Response({
            'detail': "Profile picture uploaded successfully",
             'profile_picture': profile_picture_url
        }, status=status.HTTP_200_OK )

    def update_friends_service(self, request, profile_picture_url):
        """
        Updates profile picture url in the friends service
        """

        headers = {
            "Content-Type": "application/json",
            "Authorization": request.headers.get("Authorization")
        }

        if "X-42-Token" in request.headers:
            headers['X-42-Token'] = request.headers.get('X-42-Token')

        payload = {
            "profile_picture_url": profile_picture_url,
        }

        response = requests.put(FRIENDS_SERVICE_URl, json=payload, headers=headers)
        response.raise_for_status()



class GetUserData(generics.GenericAPIView):
    """
    Generic View to retrieve user data
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        user = request.user

        profile_picture_url = (
            request.build_absolute_uri(user.profile_picture.url)
            if user.profile_picture and hasattr(user.profile_picture, 'url')
            else None
        )

        response = Response({
            "detail": "User data",
            "username": user.username,
            "user_id": user.id,
            "mfa_enable_flag": user.mfa_enabled,
            "logged_in": user.logged_in,
            "profile_picture": profile_picture_url,
            "displayname": user.displayname
        }, status=status.HTTP_200_OK)

        return response


class UpdateDisplayName(generics.GenericAPIView):
    """
    Generic View to update display name for the user
    """

    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
    serializer_class = UpdateDisplayNameSerializer

    def put(self, request, *args, **kwargs):
        user = request.user

        try:
            serializer = self.get_serializer(data=request.data)
            if not request.data.get('displayname'):
                return Response(
                    {"detail": "Missing displayname"},  # Pass error details for clarity
                    status=status.HTTP_400_BAD_REQUEST
                )

            if serializer.is_valid(raise_exception=True):
                new_display_name = serializer.validated_data['displayname']

                user.displayname = new_display_name
                user.save()
                return Response({
                    "detail": "Display name updated successfully.",
                    "username": user.username,
                    "displayname": user.displayname
                }, status=status.HTTP_200_OK)

        except ValidationError as e:
            return Response(
                {"detail": "Display name can only contain alphabets, numbers and underscore"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CheckUserExistence(generics.GenericAPIView):
    """
    Generic View to check if a user exits or not, if yes return username and user id
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        receiver_username = request.query_params.get('username')

        if not receiver_username:
            return Response(
                {"detail": "Username required"},
                status = HTTP_400_BAD_REQUEST
            )

        try:
            receiver = CustomUser.objects.get(username=receiver_username)

            return Response({
                "does_exist": True,
                "username": receiver.username,
                "profile_picture_url": receiver.profile_picture_url,
            }, status=HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response(
                {"detail": f"User '{receiver_username}' does not exist.",
                 "does_exist": False},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
import pyotp
import requests
from rest_framework.status import HTTP_400_BAD_REQUEST

from .helpers import (
    create_otp_secret_for_user,
    generate_qr_code,
    send_qr_code_response
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .permissions import IsOwnerAndNotDelete


# Create your views here.

class Enable2FAView(APIView):
    """
    API to enable two-factor authentication.
    """
    permission_classes = [IsAuthenticated, IsOwnerAndNotDelete]

    def post(self, request):
        user = request.user
        user_profile = user.userprofile
        if user_profile.mfa_enabled:
            return Response(
                {'detail': '2FA is already enabled.'},
                status=HTTP_400_BAD_REQUEST
            )
        otp_secret = create_otp_secret_for_user(user)
        qr_code = generate_qr_code(otp_secret, user)
        response = send_qr_code_response(qr_code)

        return response


class Verify2FAView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerAndNotDelete]

    def post(self, request):
        user = request.user
        otp_code = request.data.get('otp_code')
        if not otp_code:
            return Response(
                {"detail": "OTP Code is missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_profile = user.userprofile
            otp_secret = user_profile.otp_secret # extract otp secret
            if not otp_secret:
                return Response(
                    {"detail": "2FA is not enabled."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            totp = pyotp.TOTP(otp_secret)
            if totp.verify(otp_code):
                if not user_profile.mfa_enabled:
                    user_profile.mfa_enabled = True
                    user_profile.save()

                    update_mfa_url = "http://authservice:8000/api/auth/setmfaflag/"
                    try:
                        api_response = requests.put(update_mfa_url, json={
                            'user_id': user.id,
                            'username': user.username,
                            'mfa_enabled': True
                        })
                        if api_response.status_code != 200:
                            return Response(
                                {"detail": "Failed to update MFA flag."},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    except Exception as e:
                        return Response(
                            {'detail': str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                return Response(
                    {"message": "2FA verification successful"},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"detail": "Bad request. Invalid or missing 2FA Code"},
                    status=status.HTTP_400_BAD_REQUEST)


        except AttributeError:  # Handle missing userprofile
            return Response(
                {"detail": "UserProfile not found for this user."},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:  # Catch any other unexpected errors
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class Disable2FAView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerAndNotDelete]

    def put(self, request):
        user = request.user
        user_profile = user.userprofile

        user_id = user.id
        username = user.username
        mfa_enabled = False
        if not user_profile.otp_secret:
            return Response(
                {"detail": "2FA is already disabled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        update_mfa_url = "http://authservice:8000/api/auth/setmfaflag/"

        try:
            response = requests.put(update_mfa_url, json={
                'user_id': user_id,
                'username': username,
                'mfa_enabled': mfa_enabled
            })
            if response.status_code != 200:
                return Response(
                    {"detail": "Failed to update MFA flag."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_profile.otp_secret = None
            user_profile.save()
            return Response(
                {"message": "2FA disabled."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {'detail': str(e)},
                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
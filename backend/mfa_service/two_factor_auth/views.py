import pyotp
from .helpers import (
    decode_jwt_and_get_user_data,
    create_otp_secret_for_user,
    generate_qr_code,
    send_qr_code_response
)
from .models import UserProfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


# Create your views here.

def get_token(request):
    """Extracts JWT token from request"""
    auth_header = request.headers.get('Authorization', '')
    return auth_header.split(" ")[1] if auth_header else None

def json_error(msg, status_code=400):
    """Returns a Json error with message and status code"""
    return JsonResponse({"error": msg}, status=status_code)

@csrf_exempt
def enable_2fa(request):
    if request.method != "POST":
        return json_error("Method not allowed", 405)

    token = get_token(request)
    if not token:
        return json_error("Authorization Token is missing")

    try:
        user, is_new = decode_jwt_and_get_user_data(token)
        if not is_new:
            return json_error("2FA already enabled")

        otp_secret = create_otp_secret_for_user(user)
        qr_code = generate_qr_code(otp_secret, user)
        return send_qr_code_response(qr_code)

    except ValueError as e:
        return json_error(str(e))


class Verify2FAView(APIView):
    def post(self, request):
        token = get_token(request)
        if not token:
            return json_error("Authorization Token is missing")

        otp_code = request.POST.get('otp_code')
        if not otp_code:
            return json_error("OTP Code is missing")

        try:
            user, _ = decode_jwt_and_get_user_data(token) # decode jwt token
            otp_secret = UserProfile.objects.get(user=user).otp_secret # extract otp secret
            totp = pyotp.TOTP(otp_secret)

            if totp.verify(otp_code):
                return Response({"message": "2FA verification successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Bad request. Invalid or missing 2FA Code"}, status=status.HTTP_400_BAD_REQUEST)

        except ValueError as e:
            return json_error(str(e))


@csrf_exempt
def disable_2fa(request):
    if request.method != "POST":
        return json_error("Method not allowed", 405)

    token = get_token(request)
    if not token:
        return json_error("Authorization Token is missing")

    try:
        user, _ = decode_jwt_and_get_user_data(token)
        UserProfile.objects.get(user=user).delete()
        return JsonResponse({"message": "2FA disabled"}, status=200)

    except UserProfile.DoesNotExist:
        return json_error("User does not exist")
    except ValueError as e:
        return json_error(str(e))




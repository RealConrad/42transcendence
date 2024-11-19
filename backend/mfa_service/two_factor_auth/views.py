import jwt
import pyotp
import qrcode
import io
from PIL import Image
from django.conf import settings
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from .models import UserProfile
from django.views.decorators.csrf import csrf_exempt
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer
from qrcode.image.styles.colormasks import RadialGradiantColorMask

from django.shortcuts import render

# Create your views here.

def decode_jwt_and_get_user_data(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')
        user_id = payload.get('user_id')
        user, created = User.objects.get_or_create(id=user_id, username=username)
        return user, created
    except jwt.ExpiredSignatureError:
        raise ValueError("JWT token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("JWT token is invalid")


def create_otp_secret_for_user(user):
    user_profile, created = UserProfile.objects.get_or_create(user=user)

    if created or not user_profile.otp_secret:
        otp_secret = pyotp.random_base32()
        user_profile.otp_secret = otp_secret
        user_profile.save()
    else:
        otp_secret = user_profile.otp_secret
    return otp_secret

def generate_qr_code(otp_secret, user):
    totp = pyotp.TOTP(otp_secret)
    otpauth_url = totp.provisioning_uri(name=user.username, issuer_name='two_factor_auth')

    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H)
    qr.add_data(otpauth_url)

    # qr = qrcode.make(otpauth_url)

    qr_img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
    )
    return qr_img

def send_qr_code_response(qr):
    buffer = io.BytesIO()
    qr.save(buffer, format='PNG')
    buffer.seek(0)
    return HttpResponse(buffer, content_type='image/png')

@csrf_exempt
def two_factor_setup(request):
    if request.method == "POST":
        token = request.headers.get("Authorization", '').split(' ')[1]
        try:
            user, created = decode_jwt_and_get_user_data(token)
            if created:
                otp_secret = create_otp_secret_for_user(user)
                qr = generate_qr_code(otp_secret, user)
                return send_qr_code_response(qr)
            else:
                return JsonResponse({'error': 'User already exists and 2FA is set up'}, status=400)
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


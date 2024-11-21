import jwt
import pyotp
import qrcode
import io
from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse
from .models import UserProfile
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer

def decode_jwt_and_get_user_data(token):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')
        user_id = payload.get('user_id')
        user, created = User.objects.get_or_create(id=user_id, username=username)
        return user, created
    except jwt.ExpiredSignatureError:
        raise ValueError("JWT token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("JWT token is invalid")

    pass


def create_otp_secret_for_user(user):
    user_profile, created = UserProfile.objects.get_or_create(user=user)

    if created or not user_profile.otp_secret:
        otp_secret = pyotp.random_base32()
        user_profile.otp_secret = otp_secret
        user_profile.save()
    else:
        otp_secret = user_profile.otp_secret
    return otp_secret

    pass

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

    pass

def send_qr_code_response(qr):
    buffer = io.BytesIO()
    qr.save(buffer, format='PNG')
    buffer.seek(0)
    return HttpResponse(buffer, content_type='image/png')

    pass
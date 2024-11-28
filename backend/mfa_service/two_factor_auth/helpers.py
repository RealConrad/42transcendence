import io
import pyotp
import qrcode
from django.http import HttpResponse
from .models import UserProfile
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import RoundedModuleDrawer

def generate_otp_secret():
    return pyotp.random_base32()

def create_otp_secret_for_user(user):
    user_profile, created = UserProfile.objects.get_or_create(user=user)

    if created or not user_profile.otp_secret:
        otp_secret = generate_otp_secret()
        user_profile.otp_secret = otp_secret
        user_profile.save()
    else:
        otp_secret = user_profile.otp_secret
    return otp_secret

    pass

def generate_qr_code(otp_secret, user):
    totp = pyotp.TOTP(
        otp_secret,
        digits=6,
        interval=30,
    )

    otpauth_url = totp.provisioning_uri(
        name=user.username,
        issuer_name='transcendence_mfa_service',
    )

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(otpauth_url)
    qr.make(fit=True)
    # qr = qrcode.make(otpauth_url)
    # qrcode.make.make_image()
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
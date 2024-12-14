from django.conf import settings
from urllib.parse import urlencode
import requests
from .serializers import RemoteUserSerializer
from urllib.parse import  unquote


def authorize_url():
    params = {
        "client_id": settings.CLIENT_ID,
        "redirect_uri": settings.REDIRECT_URI,
        "scope": "public",
        "state": settings.STATE,
        "response_type": "code",
    }

    authorize_url = f"{settings.AUTHORIZE_42_URL}?{urlencode(params)}"
    return authorize_url


def create_user_from_token_data(token_data):
    user_data_url = "https://api.intra.42.fr/v2/me"
    access_token = token_data.get("access_token")
    header = {'Authorization': f'Bearer {access_token}'}

    response = requests.get(user_data_url, headers=header)
    response.raise_for_status()

    user_data = response.json()
    username = user_data.get('login')
    email = user_data.get('email')
    profile_picture_url = user_data.get('image', {}).get('link', None)

    if profile_picture_url and profile_picture_url.startswith("https%3A"):
        profile_picture_url = unquote(profile_picture_url)

    serializer = RemoteUserSerializer()
    return serializer.save_user(username=username, profile_picture_url=profile_picture_url, email=email)
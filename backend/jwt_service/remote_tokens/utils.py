import requests
from django.conf import settings

def fetch_user_info(access_token):
    validation_url = "https://api.intra.42.fr/v2/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(validation_url, headers=headers)
    response.raise_for_status()  # Raise an HTTPError for non-2xx responses
    return response.json()

def refresh_access_token(refresh_token):
    token_url = "https://api.intra.42.fr/oauth/token"
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": settings.CLIENT_ID,
        "client_secret": settings.CLIENT_SECRET,
    }
    response = requests.post(token_url, data=data)
    response.raise_for_status()  # Raise an HTTPError for non-2xx responses
    return response.json()
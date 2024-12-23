from http.client import responses

import requests
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

def update_user_match_stats(user_id, won=True, token=None):
    try:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        response = requests.post(
            f"{settings.AUTH_SERVICE_URL}/api/auth/{user_id}/update-stats/",
            json={"won": won},
            headers=headers,
            timeout=5
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Failed to update user stats for user_id {user_id}: {e}")
import requests
from rest_framework import exceptions

AUTH_SERVICE_URL = "http://authservice:8000/api/auth/check_user_existence/"

def check_user_in_auth_database(username, request):

    try:
        params = {"username": username}

        headers = {
            key: value for key, value in request.headers.items()
            if key.lower() in ["authorization", "x-42-token"]
        }

        response = requests.get(AUTH_SERVICE_URL, params=params, headers=headers)

        if response.status_code == 200:
            user_data = response.json()
            does_exist = user_data.get("does_exist")
            if not does_exist:
                raise exceptions.ValidationError("User not found in the database")
            return does_exist, user_data.get('profile_picture_url', None)
        elif response.status_code == 404:
            raise exceptions.AuthenticationFailed("User not found")
        elif response.status_code == 401 or response.status_code == 403:
            raise exceptions.APIException("Unauthorized access to the database")
        else:
            raise exceptions.APIException("Service unavailable")
    except requests.exceptions.RequestException as e:
        raise exceptions.APIException(f"Internal server error: {str(e)}")
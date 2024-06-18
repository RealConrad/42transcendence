from django.shortcuts import redirect
from django.conf import settings
import urllib
from django.utils.crypto import get_random_string
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.models import User
from .models import UserProfile, OAuthToken
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
import requests

def oauthLogin(request):
	state = get_random_string(64)
	# Store the state so we can verify when user gets redirected back.
	# Read more here on how session works: https://www.django-rest-framework.org/api-guide/requests/#standard-httprequest-attributes
	request.session['oauth_state'] = state

	params = {
		'client_id': settings.OAUTH_SETTINGS['CLIENT_ID'],
		'redirect_uri': settings.OAUTH_SETTINGS['REDIRECT_URI'],
		'response_type': 'code',
		'scope': settings.OAUTH_SETTINGS['SCOPE'],
		'state': state,
	}
	url = f"{settings.OAUTH_SETTINGS['AUTHORIZATION_URL']}?{urllib.parse.urlencode(params)}"
	return redirect(url)

def oauthCallback(request):
	code = request.GET.get('code')
	state = request.GET.get('state')
	
	if not code or not state:
		return HttpResponseBadRequest("No code or state provided for oauth callback")

	session_state = request.session.pop('oauth_state', None)

	if state != session_state:
		return HttpResponseBadRequest("Login rejected. Invalid state parameter")
	
	data = {
		'grant_type': 'authorization_code',
		'code': code,
		'redirect_uri': settings.OAUTH_SETTINGS['REDIRECT_URI'],
		'client_id': settings.OAUTH_SETTINGS['CLIENT_ID'],
		'client_secret': settings.OAUTH_SETTINGS['CLIENT_SECRET']
	}
	response = requests.post(settings.OAUTH_SETTINGS['TOKEN_URL'], data=data)
	if response.status_code != 200:
		return HttpResponseBadRequest("Failed to obtain tokens")
	
	tokens = response.json()
	access_token = tokens.get('access_token')
	refresh_token = tokens.get('refresh_token')
	expires_in = tokens.get('expires_in')

	# Send a request to fetch the user data
	user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {access_token}'})
	if user_info_response.status_code != 200:
		return HttpResponseBadRequest("Failed to obtain user information")

	user_info = user_info_response.json()
	email = user_info.get('email')
	image_url = user_info['image']['link']
	display_name = user_info.get('displayname')
	username = user_info.get('login')

	# Create or update the user in our database
	user, created = User.objects.get_or_create(email=email, defaults={'username': username})
	if not created:
		user.username = username
		user.save()
	
	# Update user's profile
	user_profile, _ = UserProfile.objects.get_or_create(user=user)
	user_profile.display_name = display_name
	user_profile.image_url = image_url
	user_profile.save()

	# Store OAuth tokens
	OAuthToken.objects.update_or_create(
		user=user,
		defaults={
			'access_token': access_token,
			'refresh_token': refresh_token,
			'expires_in': expires_in,
			'created_at': timezone.now()
		}
	)

	# Generate tokens for user (this will be stored on front end)
	refresh = RefreshToken.for_user(user)
	return JsonResponse({
		'access_token': str(refresh.access_token),
		'refresh_token': str(refresh),
		'user': {
			'username': user.username,
			'email': user.email,
			'display_name': user_profile.display_name,
			'image_url': user_profile.image_url,
		}
	})

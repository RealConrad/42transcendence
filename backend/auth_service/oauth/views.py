from django.shortcuts import redirect
from django.conf import settings
import urllib
from django.utils.crypto import get_random_string
from django.http import JsonResponse, HttpResponseBadRequest
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
	print(f"State in session: {session_state}")
	print(f"State from callback: {state}")

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
	refresh_token = tokens.get('refresh_tokens')
	return JsonResponse(tokens)

from django.db import models
from django.contrib.auth.models import User


class OAuthClient(models.Model):
	# This links the OAuth client to a specific user who registered the client. 
	# a.k.a create a relationship between 'OAuthClient' and 'User' models, indicating which user owns this client
	# Allows us to track which user created which client application --> makes sense? Probably not
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	clientID = models.CharField(max_length=255, unique=True) # Provided by client application when registers with OAuth server
	clientSecret = models.CharField(max_length=255)
	redirectURI = models.URLField() # Destination OAuth server will send user after authorization

class OAuthToken(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE) # Link the token to the user it belongs to
	client = models.ForeignKey(OAuthClient, on_delete=models.CASCADE) # Link the token to the client application that requested it
	accessToken = models.CharField(max_length=255, unique=True) # Token used access user's resources
	refreshToken = models.CharField(max_length=255, unique=True) # Token used to obtain new access token
	expiresIn = models.IntegerField() # Duration token is valid for
	createdAt = models.DateTimeField(auto_now_add=True) # Time stamp when token was created

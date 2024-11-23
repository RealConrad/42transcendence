from django.db import models
from django.contrib.auth.models import User


# class OAuthClient(models.Model):
# 	# This links the OAuth client to a specific user who registered the client. 
# 	# a.k.a create a relationship between 'OAuthClient' and 'User' models, indicating which user owns this client
# 	# Allows us to track which user created which client application --> makes sense? Probably not
# 	user = models.ForeignKey(User, on_delete=models.CASCADE)
# 	clientID = models.CharField(max_length=255, unique=True) # Provided by client application when registers with OAuth server
# 	clientSecret = models.CharField(max_length=255)
# 	redirectURI = models.URLField() # Destination OAuth server will send user after authorization


class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	display_name = models.CharField(max_length=255)
	image_url = models.URLField()

	def __str__(self):
		return self.user.username

class OAuthToken(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE) # Link the token to the user it belongs to
	access_token = models.CharField(max_length=255, unique=True) # Token used access user's resources
	refresh_token = models.CharField(max_length=255, unique=True) # Token used to obtain new access token
	expires_in = models.IntegerField() # Duration token is valid for
	created_at = models.DateTimeField(auto_now_add=True) # Time stamp when token was created

	def __str__(self):
		return f"{self.user.username} - {self.access_token}"

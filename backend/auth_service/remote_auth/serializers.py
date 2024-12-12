from authentication.models import CustomUser
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

class RemoteUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'profile_picture_url']

    def save_user(self, username, profile_picture_url=None):
        """
        Create or update a user with the given username and profile_picture_url
        """
        if CustomUser.objects.filter(username=username).exists():
            raise ValidationError("detail: A user with this username already exists")
        user = CustomUser(username=username, profile_picture_url=profile_picture_url, displayname=username)
        user.save()
        return user
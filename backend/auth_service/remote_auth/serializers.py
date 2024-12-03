from authentication.models import CustomUser
from rest_framework import serializers

class RemoteUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'profile_picture_url']

    def save_user(self, username, profile_picture_url=None):
        """
        Create or update a user with the given username and profile_picture_url
        """
        user, created = CustomUser.objects.get_or_create(username=username)
        if profile_picture_url:
            user.profile_picture_url = profile_picture_url
            user.save()
        return user
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
        if CustomUser.objects.filter(username=username).exists():
            raise serializers.ValidationError("User with this username already exists")
        user = CustomUser(username=username, profile_picture_url=profile_picture_url)
        user.save()
        return user
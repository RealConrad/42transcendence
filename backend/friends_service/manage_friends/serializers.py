from rest_framework import serializers
from .models import Friendship, FriendRequest, UserProfile
from .utils import check_user_in_auth_database
from django.contrib.auth.models import User

class FriendRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and handling friend requests
    """

    receiver_username = serializers.CharField(write_only=True)
    sender = serializers.StringRelatedField(read_only=True)
    receiver = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ("id", "sender", "receiver", "receiver_username", "status", "created_at")
        read_only_fields = ("id", "sender", "receiver", "status", "created_at")

    def create(self, validated_data):
        """
        Overridden create method:
        - Fetch receiver's ID using the authentication service.
        - Prevent duplicate friend requests.
        - Create a new FriendRequest object.
        """
        sender = self.context["request"].user # Authenticated user from authentication.py
        receiver_username = validated_data.pop("receiver_username") # friend name to add as friend

        does_exist = check_user_in_auth_database(receiver_username, self.context["request"])

        if not does_exist:
            raise serializers.ValidationError("User not found in the database")

        # Check for receiver in the local db if not create him
        receiver, _ = User.objects.get_or_create(username=receiver_username)
        UserProfile.objects.get_or_create(user=receiver)

        if FriendRequest.objects.filter(sender=sender, receiver=receiver ,status="pending").exists():
            raise serializers.ValidationError("A pending friend request already exists for this user.")

        friend_request = FriendRequest.objects.create(
            sender=sender, receiver=receiver ,status="pending"
        )
        return friend_request


class FriendshipSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying a user's friendships.
    - user: Displays the username of the friendship owner.
    - friends: Displays a list of friends' usernames.
    """
    user = serializers.StringRelatedField()
    friends = serializers.StringRelatedField(many=True)

    class Meta:
        model = Friendship
        fields = ("user", "friends")
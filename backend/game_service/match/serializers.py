from rest_framework import serializers
from .models import Match, UserProfile
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model
    """
    user = serializers.SlugRelatedField(read_only=True, slug_field='username')

    class Meta:
        model = UserProfile
        fields = ['user', 'tournaments_played', 'tournaments_won']
        read_only_fields = ['tournaments_played', 'tournaments_won']

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the user model with Userpofile data
    """
    profile = UserProfileSerializer(source='userprofile', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'profile']


class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer for the Match Model
    """
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Match
        fields = [
            'user',
            'player1_username',
            'player2_username',
            'player1_score',
            'player2_score',
            'winner',
            'created_at'
        ]
        read_only_fields = ['user', 'created_at', 'winner']  # Prevent fields from being manually set

    def validate(self, attrs):
        if attrs['player2_username'] == attrs['player1_username']:
            raise serializers.ValidationError(
                {"error": "Player 2 cannot have the same name as player 1"}
            )
        return attrs
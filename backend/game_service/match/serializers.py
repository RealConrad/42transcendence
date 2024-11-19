from rest_framework import serializers
from .models import Match

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = [
            'user_id',
            'player1_username',
            'player2_username',
            'player1_score',
            'player2_score',
            'created_at'
        ]
        read_only_fields = ['user_id', 'created_at', 'winner']  # Prevent fields from being manually set

    def validate(self, attrs):
        if attrs['player2_username'] == attrs['player1_username']:
            raise serializers.ValidationError(
                {"error": "Player 2 cannot have the same name as player 1"}
            )
        return attrs
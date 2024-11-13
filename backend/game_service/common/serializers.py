from rest_framework import serializers
from .models import GameLobby


class GameLobbySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameLobby
        fields = '__all__'


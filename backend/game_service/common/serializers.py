from rest_framework import serializers
from .models import GameLobby, GameQueue, GuestUser


class GameLobbySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameLobby
        fields = '__all__'


class GameQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameQueue
        fields = '__all__'


class GuestUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestUser
        fields = '__all__'

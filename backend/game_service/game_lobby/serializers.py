from authentication import serializers
from .models import GameLobby, GameQueue


class GameLobbySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameLobby
        fields = '__all__'


class GameQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameQueue
        fields = '__all__'

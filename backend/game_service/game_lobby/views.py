from game_lobby.models import GameQueue
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import GameQueue, GameLobby
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import GameQueueSerializer


class FindMatchView(APIView):
    def post(self, request):
        user = request.user

        # Check if player is already in the queue
        if GameQueue.objects.filter(user=user).exists():
            return Response({"detail": "Player is already in queue"}, status=status.HTTP_400_BAD_REQUEST)

        game_queue = GameQueue.objects.create(player=user).first()
        serializer = GameQueueSerializer(game_queue)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
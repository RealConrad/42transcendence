from rest_framework.views import APIView
from rest_framework.response import Response
from .models import GameQueue, GameLobby
from rest_framework import status
from .serializers import GameQueueSerializer, GameLobbySerializer


class FindMatchView(APIView):
    @staticmethod
    def post(request):
        user = request.user

        # Check if player is already in the queue
        if GameQueue.objects.filter(user=user).exists():
            return Response({"detail": "Player is already in queue"}, status=status.HTTP_400_BAD_REQUEST)

        game_queue = GameQueue.objects.create(player=user).first()

        # Try to match with another player
        available_queue = GameQueue.objects.exlude(user=user).first()
        if available_queue:
            # We found a match, remove the players from the queue
            GameQueue.objects.filter(player=available_queue.player).delete()
            GameQueue.objects.filter(player=user).delete()

            # Create new game lobby
            game_lobby = GameLobby.objects.create(player1=available_queue.player, player2=user)
            serializer = GameLobbySerializer(game_lobby)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # No match found, keep the player in the queue
        serializer = GameQueueSerializer(game_queue)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LeaveMatchQueueView(APIView):
    @staticmethod
    def post(request):
        user = request.user
        if GameQueue.objects.filter(user=user).exists():
            GameQueue.objects.filter(player=user).delete()
            return Response({"detail": "Player has been removed from queue"}, status=status.HTTP_200_OK)
        return Response({"error": "Player is not in queue"}, status=status.HTTP_400_BAD_REQUEST)


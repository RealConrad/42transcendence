from rest_framework.views import APIView
from rest_framework.response import Response
from .models import GameQueue, GameLobby, GuestUser
from rest_framework import status
from .serializers import GameQueueSerializer, GameLobbySerializer


class FindMatchView(APIView):
    @staticmethod
    def post(request):
        if request.user.is_authenticated:
            player = request.user.username
        else:
            player = request.data.get('username')
            if not player:
                return Response({"error": "Guest username is required"}, status=status.HTTP_400_BAD_REQUEST)
            GuestUser.objects.get_or_create(username=player)

        # Check if player is already in the queue
        if GameQueue.objects.filter(player=player).exists():
            return Response({"detail": "Username already exists or is already in queue"},
                            status=status.HTTP_400_BAD_REQUEST)

        game_queue = GameQueue.objects.create(player=player)

        # Try to match with another player
        available_queue = GameQueue.objects.exlude(player=player).first()
        if available_queue:
            # We found a match, remove the players from the queue
            GameQueue.objects.filter(player=available_queue.player).delete()
            GameQueue.objects.filter(player=player).delete()

            # Create new game lobby
            game_lobby = GameLobby.objects.create(player1=available_queue.player, player2=player)
            serializer = GameLobbySerializer(game_lobby)

            return Response({
                "lobby_id": game_lobby.id,
                "game": serializer.data
            }, status=status.HTTP_201_CREATED)

        # No match found, keep the player in the queue
        serializer = GameQueueSerializer(game_queue)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LeaveMatchQueueView(APIView):
    @staticmethod
    def post(request):
        if request.user.is_authenticated:
            player = request.user.username
        else:
            player = request.data.get('username')
            if not player:
                return Response({"error": "Guest username is required"}, status=status.HTTP_400_BAD_REQUEST)

        if GameQueue.objects.filter(player=player).exists():
            GameQueue.objects.filter(player=player).delete()
            return Response({"detail": "Player has been removed from queue"}, status=status.HTTP_200_OK)
        return Response({"error": "Player is not in queue"}, status=status.HTTP_400_BAD_REQUEST)

import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from game_service.utils import verify_token_with_auth_service
from common.models import GameLobby, GameQueue, GuestUser
from common.serializers import GameLobbySerializer
from rest_framework.exceptions import AuthenticationFailed


class MatchmakingConsumer(AsyncWebsocketConsumer):
    waiting_players = {}

    async def connect(self):
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'player'):
            self.waiting_players.pop(self.player, None)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        if action == 'join_queue':
            token = data.get('token')
            if token:
                try:
                    user_data = await sync_to_async(verify_token_with_auth_service)(token)
                    player = user_data.get('player')
                except AuthenticationFailed as e:
                    await self.send(text_data=json.dumps({"error": str(e)}))
                    return
            else:
                player = data.get('username')
                if not player:
                    await self.send(text_data=json.dumps({"error": "Guest username not provided"}))
                    return
                await sync_to_async(GuestUser.objects.get_or_create)(username=player)

            await self.join_queue(player)

    async def join_queue(self, player):
        self.waiting_players[player] = self.channel_name

        if len(self.waiting_players) >= 2:
            players = list(self.waiting_players.keys())
            player1 = players[0]
            player2 = players[1]

            channel_name1 = self.waiting_players.pop(player1)
            channel_name2 = self.waiting_players.pop(player2)

            game_lobby, created = await sync_to_async(GameLobby.objects.get_or_create)(player1=player1, player2=player2)
            serializer = GameLobbySerializer(game_lobby).data
            await self.notify_players(channel_name1, player1, serializer)
            await self.notify_players(channel_name2, player2, serializer)

    async def notify_players(self, channel_name, player, game_data):
        await self.channel_layer.send(
            channel_name,
            {
                'type': 'match_found',
                'message': {
                    'lobby_id': game_data['id'],
                    'game': game_data
                }
            }
        )

    async def match_found(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'message': message
        }))

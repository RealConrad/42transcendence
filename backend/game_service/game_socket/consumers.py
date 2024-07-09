import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import sync_to_async
from common.models import GameLobby
from .game_logic import PongGame


class GameConsumer(WebsocketConsumer):
    async def connect(self):
        self.lobby_id = self.scope['url_route']['kwargs']['lobby_id']
        if not self.lobby_id:
            await self.send(text_data=json.dumps({'error': 'Lobby_id was not present in url'}))
            return
        self.lobby_group_name = f'game_{self.lobby_id}'

        # Add this channel to the group
        self.channel_layer.group_add(self.lobby_group_name, self.channel_name)

        # Create/load the game state
        self.game_lobby = await sync_to_async(GameLobby)(id=self.lobby_id)
        self.game = PongGame(player1=self.game_lobby.player1, player2=self.game_lobby.player2)
        self.game.state = self.game_lobby.state

        await self.accept()


    async def disconnect(self, code):
        # Persist current game state to the DB
        self.game_lobby.state = self.game.state
        await sync_to_async(self.game_lobby.save)()

        # Remove this channel from the group
        await self.channel_layer.group_discard(self.lobby_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data['action']
        if action == 'update_state':
            await self.update_game_state()
        elif action == 'move_paddle':
            player = data['player']
            direction = data['direction']
            self.game.move_paddle(player, direction)
            await self.update_game_state()

    async def update_game_state(self):
        self.game.update()
        # Broadcast the updated state to the group
        await self.channel_layer.group_send(
            self.lobby_group_name,
            {
                'type': 'game_message',
                'message': self.game.get_state()
            }
        )

    async def game_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'game',
            'message': message
        }))

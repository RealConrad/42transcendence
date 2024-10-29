import json
import asyncio
import logging
from contextlib import nullcontext

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from common.models import GameLobby
from game_logic.game_manager import GameManager

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.lobby_id = 0
        self.lobby_group_name = nullcontext
        self.game_lobby = nullcontext
        self.game = nullcontext

    async def connect(self):
        self.lobby_id = self.scope['url_route']['kwargs']['lobby_id']
        if not self.lobby_id:
            await self.close(code=400)
            return
        self.lobby_group_name = f'game_{self.lobby_id}'

        await self.channel_layer.group_add(self.lobby_group_name, self.channel_name)

        self.game_lobby = await sync_to_async(GameLobby.objects.get)(id=self.lobby_id)
        self.game = GameManager.get_game(self.lobby_id, player1=self.game_lobby.player1, player2=self.game_lobby.player2)

        # Start the game loop if it's not already running
        await GameManager.start_game_loop(self.lobby_id, self.game, self.channel_layer, self.lobby_group_name)

        await self.accept()

        await self.send_game_state()

    async def disconnect(self, code):
        # if not self.channel_layer.groups.get(self.lobby_group_name, []):
        #     GameManager.cleanup_game(self.lobby_id)
        await self.channel_layer.group_discard(self.lobby_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        player = data.get('player')
        if action == 'move_paddle':
            direction = data.get('direction')
            async with GameManager.get_lock(self.lobby_id):
                game = GameManager.get_game(self.lobby_id)
                game.move_paddle(player, direction)
        elif action == 'stop_paddle':
            async with GameManager.get_lock(self.lobby_id):
                game = GameManager.get_game(self.lobby_id)
                game.stop_paddle(player)

    async def game_state(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'message': message
        }))

    async def send_game_state(self):
        state = self.game.get_state()
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'message': state
        }))

    async def game_over(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'message': message
        }))
        # Cleanup since game is over
        await self.close()

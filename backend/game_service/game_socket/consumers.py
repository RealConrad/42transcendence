import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from common.models import GameLobby
from game_logic.game_logic import PongGame

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.lobby_id = self.scope['url_route']['kwargs']['lobby_id']
        if not self.lobby_id:
            await self.close(code=400)
            return
        self.lobby_group_name = f'game_{self.lobby_id}'

        # Add this channel to the group
        await self.channel_layer.group_add(self.lobby_group_name, self.channel_name)

        # Load or create the game state
        self.game_lobby = await sync_to_async(GameLobby.objects.get)(id=self.lobby_id)
        self.game = PongGame(player1=self.game_lobby.player1, player2=self.game_lobby.player2)
        await self.accept()
        # Start the game loop
        self.game_task = asyncio.create_task(self.game_loop())

    async def disconnect(self, code):
        # Cancel the game loop
        self.game_task.cancel()

        # Remove this channel from the group
        await self.channel_layer.group_discard(self.lobby_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data['action']
        if action == 'move_paddle':
            player = data['player']
            direction = data['direction']
            self.game.move_paddle(player, direction)

    async def game_loop(self):
        while True:
            self.game.update()
            await self.save_game_state()
            await self.send_game_state()
            await asyncio.sleep(1 / 30)  # 30 FPS

    async def save_game_state(self):
        # Update the game state in the database
        self.game_lobby.state = self.game.get_state()
        await sync_to_async(self.game_lobby.save)()

        # Save the game state to Redis
        await self.channel_layer.group_send(
            self.lobby_group_name,
            {
                'type': 'game_state',
                'message': self.game.get_state()
            }
        )

    async def send_game_state(self):
        # Broadcast the game state to all players in the lobby
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

    async def game_state(self, event):
        # Handle incoming game state updates
        message = event['message']
        self.game.load_state(message)

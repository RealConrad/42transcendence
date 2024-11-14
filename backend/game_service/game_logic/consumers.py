import logging
import uuid

from channels.generic.websocket import AsyncWebsocketConsumer

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.lobby_id = self.scope['url_route']['kwargs']['game_id']
        self.group_name = f"game_{self.lobby_id}"
        self.player_id = str(uuid.uuid4())
import json
from channels.generic.websocket import WebsocketConsumer


class PongConsumer(WebsocketConsumer):
    def connect(self):
        pass

    def disconnect(self, close_code):
        pass

    # Called when new message received on WS
    def receive(self, text_data=None, bytes_data=None):
        pass

    def move_paddle(self, direction):
        pass

    def update_game_state(self):
        pass

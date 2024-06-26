import json
from channels.generic.websocket import WebsocketConsumer


class LobbyConsumer(WebsocketConsumer):
    def connect(self):
        pass

    def disconnect(self, code):
        pass

    def receive(self, text_data=None, bytes_data=None):
        pass

    def lobby_message(self, event):
        pass

import json
from channels.generic.websocket import WebsocketConsumer


class PongConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.game_state = {
            "paddle1": {"x": 10, "y": 10, "width": 10, "height": 75},
            "paddle2": {"x": 800, "y": 200, "width": 10, "height": 75},
            "ball": {"x": 400, "y": 300, "dx": 20, "dy": 20, "radius": 10},
        }
        self.send(text_data=json.dumps(self.game_state))

    def disconnect(self, close_code):
        pass

    # Called when new message received on WS
    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        action = data["action"]
        if action == "move_paddle":
            self.move_paddle(data["paddle"], data["direction"])
        self.update_game_state()
        self.send(text_data=json.dumps(self.game_state))

    def move_paddle(self, paddle, direction):
        if paddle == "paddle1":
            if direction == "up":
                self.game_state["paddle1"]["y"] += 10
            elif direction == "down":
                self.game_state["paddle1"]["y"] -= 10
        elif paddle == "paddle2":
            if direction == "up":
                self.game_state["paddle2"]["y"] -= 10
            elif direction == "down":
                self.game_state["paddle2"]["y"] += 10

    def update_game_state(self):
        ball = self.game_state["ball"]
        ball["x"] += ball["dx"]
        ball["y"] += ball["dy"]
        if ball["y"] + ball["dy"] > 600 or ball["y"] + ball["dy"] < 0:
            ball["dy"] = -ball["dy"]
        if ball["x"] + ball["dx"] > 800 or ball["x"] + ball["dx"] < 0:
            ball["dx"] = -ball["dx"]

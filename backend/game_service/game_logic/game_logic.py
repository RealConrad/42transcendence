import logging
from typing import Final

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


WIDTH: Final[int] = 1280
HEIGHT: Final[int] = 720


class PongGame:
    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
        self.ball_data = {
            'position': {'x': WIDTH / 2, 'y': HEIGHT / 2},
            'velocity': {'x': 5, 'y': 5},
            'radius': 10
        }
        self.paddle_data = {
            self.player1: {'x': 10, 'y': 310, 'height': 75, 'width': 10},
            self.player2: {'x': 1260, 'y': 310, 'height': 75, 'width': 10},
        }
        self.scores = {self.player1: 0, self.player2: 0}
        self.game_completed = False,

    def load_state(self, state):
        self.ball_data = state['ball_data']
        self.paddle_data = state['paddle_data']
        self.scores = state['scores']

    def update(self):
        # Update ball position based on velocity
        self.ball_data['position']['x'] += self.ball_data['velocity']['x']
        self.ball_data['position']['y'] += self.ball_data['velocity']['y']

        # Check for wall collision
        if self.ball_data['position']['x'] <= 0 or self.ball_data['position']['x'] >= WIDTH:
            self.ball_data['velocity']['x'] = -self.ball_data['velocity']['x']
        if self.ball_data['position']['y'] <= 0 or self.ball_data['position']['y'] >= HEIGHT:
            self.ball_data['velocity']['y'] = -self.ball_data['velocity']['y']
        self.check_paddle_collision()

    def check_paddle_collision(self):
        ball_x = self.ball_data['position']['x']
        ball_y = self.ball_data['position']['y']
        ball_radius = self.ball_data['radius']
        ball_left = ball_x - ball_radius
        ball_right = ball_x + ball_radius
        ball_top = ball_y - ball_radius
        ball_bottom = ball_y + ball_radius
        for _, paddle in self.paddle_data.items():
            paddle_left = paddle['x'] - paddle['width']
            paddle_right = paddle['x'] + paddle['width']
            paddle_top = paddle['y'] - paddle['height']
            paddle_bottom = paddle['y'] + paddle['height']
            if (ball_right >= paddle_left and ball_left <= paddle_right and ball_bottom >= paddle_top and
                    ball_top <= paddle_bottom):
                self.ball_data['velocity']['x'] = -self.ball_data['velocity']['x']
                self.ball_data['velocity']['y'] = -self.ball_data['velocity']['y']
                logging.info("Paddle collision detected!")

    def get_state(self):
        return {
            'player1': self.player1,
            'player2': self.player2,
            'ball_data': self.ball_data,
            'paddle_data': self.paddle_data,
            'scores': self.scores
        }

    def move_paddle(self, player, direction):
        if player not in self.paddle_data:
            logging.error(f"Player {player} not found in paddle_data")
            return
        if direction == 'up':
            self.paddle_data[player]['y'] = max(0, self.paddle_data[player]['y'] - 50)
        elif direction == 'down':
            self.paddle_data[player]['y'] = min(HEIGHT - 75, self.paddle_data[player]['y'] + 50)

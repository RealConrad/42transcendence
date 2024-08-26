import logging
from typing import Final
import math

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
        # TODO: ADD POWERUPS
        self.players_data = {
            self.player1: {'paddle': {'x': 10, 'y': 310, 'height': 75, 'width': 10}},
            self.player2: {'paddle': {'x': 1260, 'y': 310, 'height': 75, 'width': 10}}
        }
        self.scores = {
            self.player1: 0,
            self.player2: 0,
        }

    def reset(self):
        logging.info("Resetting game state...")
        self.ball_data = {
            'position': {'x': WIDTH / 2, 'y': HEIGHT / 2},
            'velocity': {'x': 5, 'y': 5},
            'radius': 10
        }
        self.players_data = {
            self.player1: {'paddle': {'x': 10, 'y': 310, 'height': 75, 'width': 10}},
            self.player2: {'paddle': {'x': 1260, 'y': 310, 'height': 75, 'width': 10}}
        }

    def load_state(self, state):
        self.ball_data = state.get('ball_data', self.ball_data)
        self.players_data = state.get('players_data', self.players_data)

    def update(self):
        # Update ball position based on velocity
        self.ball_data['position']['x'] += self.ball_data['velocity']['x']
        self.ball_data['position']['y'] += self.ball_data['velocity']['y']

        # Check for wall collision (top & bottom)
        if self.ball_data['position']['y'] <= 0 or self.ball_data['position']['y'] >= HEIGHT:
            self.ball_data['velocity']['y'] *= -1

        self.check_paddle_collision()
        self.check_if_player_scored()

    def check_if_player_scored(self):
        if self.ball_data['position']['x'] <= 0:  # Player 2 scores
            self.increase_score(self.player2)
        elif self.ball_data['position']['x'] >= WIDTH:  # Player 1 scores
            self.increase_score(self.player1)

    def increase_score(self, player):
        logging.info(f'{player} scored!')
        self.scores[player] += 1
        logging.info("Resetting game state now....")
        self.reset()

    def check_paddle_collision(self):
        ball_x = self.ball_data['position']['x']
        ball_y = self.ball_data['position']['y']
        ball_radius = self.ball_data['radius']

        for player, data in self.players_data.items():
            paddle = data['paddle']
            paddle_left = paddle['x']
            paddle_right = paddle['x'] + paddle['width']
            paddle_top = paddle['y']
            paddle_bottom = paddle['y'] + paddle['height']

            if (
                    paddle_left <= ball_x + ball_radius <= paddle_right or paddle_left <= ball_x - ball_radius <= paddle_right) and (
                    paddle_top <= ball_y <= paddle_bottom):
                self.ball_data['velocity']['x'] *= -1
                # logging.info(f"Collision with {player}'s paddle, new velocity: {self.ball_data['velocity']}")
                return

    def get_state(self):
        return {
            'ball_data': self.ball_data,
            'players_data': self.players_data,
            'player1': self.player1,
            'player2': self.player2,
            'scores': self.scores,
        }

    def move_paddle(self, player, direction):
        if player not in self.players_data:
            logging.error(f"Player {player} not found in paddle_data")
            return
        if direction == 'up':
            self.players_data[player]['paddle']['y'] = max(0, self.players_data[player]['paddle']['y'] - 50)
        elif direction == 'down':
            self.players_data[player]['paddle']['y'] = min(HEIGHT - self.players_data[player]['paddle']['height'],
                                                           self.players_data[player]['paddle']['y'] + 50)
        # logging.info(f"Player {player} new position y-pos: {self.players_data[player]['paddle']['y']}")


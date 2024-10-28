import logging
from typing import Final
import random

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

WIDTH: Final[int] = 1280
HEIGHT: Final[int] = 720


class PongGame:
    MAX_SCORE = 3

    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
        self.players_data = {}
        self.ball_data = {}
        self.match_time = 0
        self.winner = None
        self.game_over = False
        self.scores = {self.player1: 0, self.player2: 0}
        self.reset()

    def reset(self):
        logging.info("Resetting game state...")
        self.ball_data = {
            'position': {'x': WIDTH / 2, 'y': HEIGHT / 2},
            'velocity': {'x': 10 * (-1 if random.choice([True, False]) else 1), 'y': 10},
            'radius': 10
        }
        self.match_time = 0
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
        if self.scores[player] == self.MAX_SCORE:
            self.game_over = True
            self.winner = player
        else:
            self.reset()

    def get_winner(self):
        return self.winner

    def is_game_over(self):
        return self.game_over

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
            'game_over': self.game_over
        }

    def move_paddle(self, player, direction):
        if player not in self.players_data:
            logging.error(f"Player {player} not found in paddle_data")
            return
        paddle = self.players_data[player]['paddle']
        speed = 50  # TODO: SHOULD NOT BE HARD CODED!
        if direction == 'up':
            paddle['y'] = max(0, paddle['y'] - speed)
        elif direction == 'down':
            paddle['y'] = min(HEIGHT - paddle['height'], paddle['y'] + speed)

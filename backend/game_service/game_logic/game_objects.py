import asyncio
import logging
import random

from .constants import WIDTH, HEIGHT, MAX_SCORE


class Ball:
    def __init__(self):
        self.x = 0
        self.y = 0
        self.velocity_x = 0
        self.velocity_y = 0
        self.radius = 0
        self.reset()

    def reset(self):
        self.x = WIDTH / 2
        self.y = HEIGHT / 2
        self.velocity_x = 10 * (-1 if random.choice([True, False]) else 1)
        self.velocity_y = 10 # TODO: Change to maybe something random
        self.radius = 10

    def update_position(self):
        self.x += self.velocity_x
        self.y += self.velocity_y

        if self.y - self.radius <= 0:
            self.y = self.radius
            self.velocity_y *= -1
        elif self.y + self.radius >= HEIGHT:
            self.y = HEIGHT - self.radius
            self.velocity_y *= 1

    def serialize(self):
        return {
            'x': self.x,
            'y': self.y,
            'velocity_x': self.velocity_x,
            'velocity_y': self.velocity_y,
            'radius': self.radius
        }

class Paddle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.height = 75
        self.width = 10
        self.velocity_y = 0
        self.speed = 50

    def move_up(self):
        self.velocity_y = -self.speed

    def move_down(self):
        self.velocity_y = self.speed

    def stop(self):
        self.velocity_y = 0

    def update_position(self):
        self.y += self.velocity_y

        if self.y < 0:
            self.y = 0
        elif self.y + self.height > HEIGHT:
            self.y = HEIGHT - self.height

    def serialize(self):
        return {
            'x': self.x,
            'y': self.y,
            'width': self.width,
            'height': self.height,
            'velocity_y': self.velocity_y
        }


class Player:
    def __init__(self, player_id, username, is_registered=False, user_id=None, side='left'):
        self.player_id = player_id
        self.username = username
        self.is_registered = is_registered,
        self.user_id = user_id,
        self.side = side
        self.paddle = self.assign_paddle()
        self.score = 0

    def assign_paddle(self):
        if self.side == 'left':
            return Paddle(x = 20, y = HEIGHT / 2)
        elif self.side == 'right':
            return Paddle(x = WIDTH - 20, y = HEIGHT / 2)

    def update_score(self):
        self.score += 1

    def serialize(self):
        return {
            'player_id': self.player_id,
            'username': self.username,
            'is_registered': self.is_registered,
            'user_id': self.user_id,
            'side': self.side,
            'paddle': self.paddle.serialize(),
            'score': self.score
        }

class GameState:
    def __init__(self, game_id, player1: Player, player2: Player):
        self.game_id = game_id
        self.player1 = player1
        self.player2 = player2
        self.ball = Ball()
        self.game_running = True

    def update(self):
        if not self.game_running:
            return
        self.ball.update_position()
        self.player1.paddle.update_position()
        self.player2.paddle.update_position()
        self.check_paddle_collision()
        self.check_score()

    def check_paddle_collision(self):
        # Collision with player1's paddle
        if (self.ball.x - self.ball.radius <= self.player1.paddle.x + self.player1.paddle.width and
            self.player1.paddle.y <= self.ball.y <= self.player1.paddle.y + self.player1.paddle.height):

            self.ball.x = self.player1.paddle.x + self.player1.paddle.width + self.ball.radius
            self.ball.velocity_x *= -1.1

            # Adjust Y velocity based on where it hit the paddle
            offset = (self.ball.y - (self.player1.paddle.y + self.player1.paddle.height / 2)) / (self.player1.paddle.height / 2)
            self.ball.velocity_y = offset * 10

        # Collision with player2's paddle
        if (self.ball.x + self.ball.radius >= self.player2.paddle.x and
            self.player2.paddle.y <= self.ball.y <= self.player2.paddle.y + self.player2.paddle.height):

            self.ball.x = self.player2.paddle.x - self.ball.radius
            self.ball.velocity_x *= -1.1

            # Adjust Y velocity based on where it hit the paddle
            offset = (self.ball.y - (self.player2.paddle.y + self.player2.paddle.height / 2)) / (self.player2.paddle.height / 2)
            self.ball.velocity_y = offset * 10

    def check_score(self):
        if self.ball.x < 0:
            self.player2.update_score()
            self.ball.reset()
        elif self.ball.x > WIDTH:
            self.player1.update_score()
            self.ball.reset()

        if self.player1.score == MAX_SCORE or self.player2.score == MAX_SCORE:
            self.game_running = False

    def serialize(self):
        return {
            'game_id': self.game_id,
            'player1': self.player1.serialize(),
            'player2': self.player2.serialize(),
            'ball': self.ball.serialize(),
            'game_running': self.game_running
        }

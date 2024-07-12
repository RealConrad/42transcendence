import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


class PongGame:
    def __init__(self, player1, player2):
        logging.debug(f"Initializing PongGame with player1: {player1}, player2: {player2}")
        self.player1 = player1
        self.player2 = player2
        self.ball_position = {'x': 640, 'y': 360}
        self.ball_velocity = {'x': 5, 'y': 5}
        self.paddle_positions = {
            self.player1: {'x': 10, 'y': 310},
            self.player2: {'x': 1260, 'y': 310}
        }
        self.scores = {self.player1: 0, self.player2: 0}

    def load_state(self, state):
        self.ball_position = state['ball_position']
        self.ball_velocity = state['ball_velocity']
        self.paddle_positions = state['paddle_positions']
        self.scores = state['scores']
        logging.debug(f"Loaded state: {state}")

    def update(self):
        # Update ball position based on velocity
        self.ball_position['x'] += self.ball_velocity['x']
        self.ball_position['y'] += self.ball_velocity['y']

        # Check for wall collision
        if self.ball_position['x'] <= 0 or self.ball_position['x'] >= 1280:
            self.ball_velocity['x'] = -self.ball_velocity['x']
        if self.ball_position['y'] <= 0 or self.ball_position['y'] >= 720:
            self.ball_velocity['y'] = -self.ball_velocity['y']

        # Check for paddle collisions
        # TODO: Add collision with paddles

    def get_state(self):
        return {
            'ball_position': self.ball_position,
            'ball_velocity': self.ball_velocity,
            'paddle_positions': self.paddle_positions,
            'scores': self.scores
        }

    def move_paddle(self, player, direction):
        logging.debug(f"Attempting to move paddle for player: {player} in direction: {direction}")
        if player not in self.paddle_positions:
            logging.error(f"Player {player} not found in paddle_positions")
            return
        if direction == 'up':
            self.paddle_positions[player]['y'] = max(0, self.paddle_positions[player]['y'] - 50)
        elif direction == 'down':
            self.paddle_positions[player]['y'] = min(720 - 75, self.paddle_positions[player]['y'] + 50)
        logging.info(f"Player {player} new position y-pos: {self.paddle_positions[player]['y']}")

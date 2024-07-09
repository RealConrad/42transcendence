class PongGame:
    def __init__(self, player1, player2):
        self.player1 = player1
        self.player2 = player2
        self.ball_position = {'x': 50, 'y': 50}
        self.ball_velocity = {'x': 0, 'y': 0}
        self.paddle_positions = {
            self.player1: {'x': 10, 'y': 50},
            self.player2: {'x': 90, 'y': 50}
        }
        self.scores = {self.player1: 0, self.player2: 0}
        self.reset()

    def reset(self):
        self.ball_position = {'x': 50, 'y': 50}
        self.ball_velocity = {'x': 0, 'y': 0}
        self.paddle_positions = {
            self.player1: {'x': 10, 'y': 50},
            self.player2: {'x': 90, 'y': 50}
        }
        self.scores = {self.player1: 0, self.player2: 0}

    def update(self):
        # Update ball position based on velocity
        self.ball_position['x'] += self.ball_position['x']
        self.ball_position['y'] += self.ball_position['y']

        # Check for wall collision
        if self.ball_position['x'] <= 0 or self.ball_velocity['x'] >= 100:
            self.ball_velocity['x'] = -self.ball_velocity['x']
        if self.ball_position['y'] <= 0 or self.ball_velocity['y'] >= 100:
            self.ball_velocity['y'] = -self.ball_velocity['y']

        # Check for paddle collisions
        # TODO: Add collision with paddles

    def get_state(self):
        return {
            'ball_position': self.ball_position,
            'paddle_positions': self.paddle_positions,
            'scores': self.scores
        }

    def move_paddle(self, player, direction):
        if direction == 'up':
            self.paddle_positions[player]['y'] = max(0, self.paddle_positions[player]['y'] - 1)
        elif direction == 'down':
            self.paddle_positions[player]['y'] = max(100, self.paddle_positions[player]['y'] + 1)

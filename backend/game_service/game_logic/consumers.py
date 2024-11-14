import json
import logging
import asyncio
import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_logic import GameLogic
from .game_objects import GameState, Player

logger = logging.getLogger(__name__)

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.group_name = None
        self.game_task = None
        self.redis = None
        self.game_logic = None
        self.game_state = None
        self.game_id = None
        self.lock = None

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.group_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()
        logger.debug(f"Player connected to game {self.game_id}")

        # TODO: Change to docker container
        self.redis = redis.Redis(host='127.0.0.1', port=6379, db=0)

        game_state_key = f"game_state:{self.game_id}"
        game_state_json = await self.redis.get(game_state_key)

        if not game_state_json:
            await self.send(text_data=json.dumps({'error': 'Game not found'}))
            await self.close(code=5000)
            logger.error(f"Game {self.game_id} not found in Redis")
            return

        game_state_data = json.loads(game_state_json)
        self.game_state = self.deserialize_game_state(game_state_data)

        lock = self.redis.lock(f"lock:game_logic:{self.game_id}", timeout=3)
        has_lock = await lock.acquire(blocking=False)
        if has_lock:
            self.game_logic = GameLogic(self.game_state, self.redis)
            self.game_task = asyncio.create_task(self.game_logic.start_game(self.channel_layer, self.group_name))
        else:
            logger.debug(f"Game logic loop already running for game: {self.game_state.game_id}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        if self.game_task and not self.game_task.done():
            try:
                self.game_state.game_running = False
                await self.game_logic
            except Exception as e:
                logger.error("error when disconnect")
        logger.debug(f"Player disconnected from game {self.game_id}")

        if self.game_task and not self.game_task.done():
            self.game_state.game_running = False
            await self.game_task

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'move_paddle':
            direction = data.get('direction')
            await self.handle_move_paddle(direction)

    async def handle_move_paddle(self, direction):
        player_id = self.scope['player_id']
        if player_id == self.game_state.player1.player_id:
            paddle = self.game_state.player1.paddle
        elif player_id == self.game_state.player2.player_id:
            paddle = self.game_state.player2.paddle
        else:
            logger.error(f"Unknown player_id: {player_id} in game {self.game_id}")
            return

        if direction == 'up':
            paddle.move_up()
        elif direction == 'down':
            paddle.move_down()
        elif direction == 'stop':
            paddle.stop()
        logger.debug(f"Paddle for player {player_id} moved {direction}")

    async def game_state_update(self, event):
        state = event['state']
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': state
        }))

    @staticmethod
    def deserialize_game_state(data):
        # print(json.dumps(data, indent=2))

        player1_data = data['player1']
        player2_data = data['player2']

        player1 = Player(
            player_id=player1_data['player_id'],
            username=player1_data['username'],
            is_registered=player1_data['is_registered'],
            user_id=player1_data['user_id'],
            side='left'
        )
        player1.assign_paddle()

        player2 = Player(
            player_id=player2_data['player_id'],
            username=player2_data['username'],
            is_registered=player2_data['is_registered'],
            user_id=player2_data['user_id'],
            side='right'
        )
        player2.assign_paddle()

        game_state = GameState(
            game_id=data['game_id'],
            player1=player1,
            player2=player2
        )
        game_state.ball.x = data['ball']['x']
        game_state.ball.y = data['ball']['y']
        game_state.ball.velocity_x = data['ball']['velocity_x']
        game_state.ball.velocity_y = data['ball']['velocity_y']
        game_state.ball.radius = data['ball']['radius']
        game_state.game_running = data['game_running']

        return game_state

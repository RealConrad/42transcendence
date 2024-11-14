import json
import logging
import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_manager import game_manager
from .game_objects import GameState, Player

logger = logging.getLogger(__name__)

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.group_name = None
        self.redis = None
        self.game_logic = None
        self.game_state = None
        self.game_id = None

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.group_name = f"game_{self.game_id}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

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

        await self.redis.incr(f"game_players:{self.game_id}")

        self.game_logic = game_manager.get_game_logic(
            game_id=self.game_id,
            game_state=self.game_state,
            redis_client=self.redis,
            channel_layer=self.channel_layer,
            group_name=self.group_name
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        logger.debug(f"Player disconnected from game {self.game_id}")

        remaining = await self.redis.decr(f"game_players:{self.game_id}")
        if remaining <= 0:
            game_manager.remove_game_logic(self.game_id)
            await self.redis.delete(f"game_players:{self.game_id}")

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'move_paddle':
            direction = data.get('direction')
            player_id = data.get('player_id')
            if direction and player_id:
                await self.game_logic.enqueue_input(direction, player_id)
            else:
                logger.error("Invalid move_paddle message format")
                await self.send(text_data=json.dumps({'error': 'Invalid move_paddle format'}))
        else:
            logger.error(f"Unknown action: {action}")
            await self.send(text_data=json.dumps({'error': 'Unknown action'}))

    async def game_state_update(self, event):
        state = event['state']
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': state
        }))

    @staticmethod
    def deserialize_game_state(data):
        # TODO: Add proper checks if data is correct, works fine for now i guess
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

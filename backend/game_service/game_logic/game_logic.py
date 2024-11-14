import asyncio
import json
import logging
from .constants import FRAMES
from .game_objects import GameState

logger = logging.getLogger(__name__)

class PongGame:
    def __init__(self, game_state: GameState, redis_client, channel_layer, group_name):
        self.game_state = game_state
        self.redis = redis_client
        self.channel_layer = channel_layer
        self.group_name = group_name
        self.update_interval = 1 / FRAMES
        self.input_queue = asyncio.Queue()
        self.game_state_key = f"game_state:{game_state.game_id}"
        self.game_task = None

    async def enqueue_input(self, action, player_id):
        await self.input_queue.put((action, player_id))

    async def start_game(self):
        logger.info(f"Starting game loop for game: {self.game_state.game_id}")
        try:
            while self.game_state.game_running:
                await self.process_inputs()
                self.game_state.update()
                await self.sync_with_redis()
                await self.broadcast_game_state()
                await asyncio.sleep(self.update_interval)
        except asyncio.CancelledError:
            logger.info(f"Game loop task cancelled for game: {self.game_state.game_id}")
        except Exception as e:
            logger.exception(f"Exception in game loop for game {self.game_state.game_id}: {e}")
        finally:
            self.game_state.game_running = False
            logger.info(f"Game loop ended for game: {self.game_state.game_id}")

    async def process_inputs(self):
        while not self.input_queue.empty():
            action, player_id = await self.input_queue.get()
            self.apply_action(action, player_id)
            self.input_queue.task_done()

    def apply_action(self, action, player_id):
        if player_id == self.game_state.player1.player_id:
            paddle = self.game_state.player1.paddle
        elif player_id == self.game_state.player2.player_id:
            paddle = self.game_state.player2.paddle
        else:
            logger.error(f"Unknown player_id: {player_id} in game {self.game_state.game_id}")
            return

        if action == 'up':
            paddle.move_up()
        elif action == 'down':
            paddle.move_down()
        elif action == 'stop':
            paddle.stop()
        else:
            logger.error(f"Invalid action: {action} from player {player_id}")

    async def sync_with_redis(self):
        await self.redis.set(self.game_state_key, json.dumps(self.game_state.serialize()))

    async def broadcast_game_state(self):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'game_state_update',
                'state': self.game_state.serialize()
            }
        )

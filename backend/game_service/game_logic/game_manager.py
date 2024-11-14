import asyncio
import logging
from .game_logic import PongGame

logger = logging.getLogger(__name__)

class GameManager:
    def __init__(self):
        self.games = {}  # {game_id: PongGame}

    def get_game_logic(self, game_id, game_state, redis_client, channel_layer, group_name):
        if game_id not in self.games:
            game = PongGame(
                game_state=game_state,
                redis_client=redis_client,
                channel_layer=channel_layer,
                group_name=group_name
            )
            self.games[game_id] = game
            game.game_task = asyncio.create_task(game.start_game())
            logger.info(f"Created and started PongGame for game_id {game_id}")
        else:
            logger.debug(f"Retrieved existing PongGame for game_id {game_id}")
        return self.games[game_id]

    def remove_game_logic(self, game_id):
        if game_id in self.games:
            game = self.games.pop(game_id)
            game.game_running = False
            if game.game_task:
                game.game_task.cancel()
                logger.info(f"Cancelled game loop for game_id {game_id}")
            logger.info(f"Removed PongGame for game_id {game_id}")

# Instantiate global GameManager
game_manager = GameManager()

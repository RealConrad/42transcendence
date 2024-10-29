import asyncio
from .game_logic import PongGame

import logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')


class GameManager:
    """
    GameManager maintains a dictionary of active _games and associated _locks.
    When get_game() is called, it returns the existing game instance or creates a new one if it doesn't exist.
    Locks ensure that updates to the game state are synchronized.
    """
    _games = {}
    _locks = {}
    _game_tasks = {}

    @classmethod
    def get_game(cls, lobby_id, player1=None, player2=None):
        if lobby_id not in cls._games:
            cls._games[lobby_id] = PongGame(player1, player2)
            cls._locks[lobby_id] = asyncio.Lock()
            cls._game_tasks[lobby_id] = None
        return cls._games[lobby_id]

    @classmethod
    def get_lock(cls, lobby_id):
        return cls._locks.get(lobby_id)

    @classmethod
    async def start_game_loop(cls, lobby_id, game, channel_layer, group_name):
        if cls._game_tasks[lobby_id] is None:  # Ensure only 1 game loop per game is running
            cls._game_tasks[lobby_id] = asyncio.create_task(cls.game_loop(lobby_id, game, channel_layer, group_name))

    @classmethod
    async def game_loop(cls, lobby_id, game, channel_layer, group_name):
        last_update_time = asyncio.get_event_loop().time()
        try:
            while True:
                # Calculate delta time
                current_time = asyncio.get_event_loop().time()
                delta_time = current_time - last_update_time
                last_update_time = current_time
                async with cls.get_lock(lobby_id):
                    game.update(delta_time)
                    state = game.get_state()

                # Broadcast game state to all players
                await channel_layer.group_send(
                    group_name,
                    {
                        'type': 'game_state',
                        'message': state
                    }
                )
                if game.is_game_over():
                    await cls.end_game(lobby_id, channel_layer, group_name, game.get_winner())
                    break
                await asyncio.sleep(1 / 60)  # 60 FPS
        except asyncio.CancelledError:
            logging.info(f"Game loop for lobby {lobby_id} was cancelled")
            cls._game_tasks[lobby_id] = None

    @classmethod
    async def end_game(cls, lobby_id, channel_layer, group_name, winner):
        await channel_layer.group_send(
            group_name,
            {
                'type': 'game_over',
                'message': {'winner': winner}
            }
        )
        cls.cleanup_game(lobby_id)

    @classmethod
    def cleanup_game(cls, lobby_id):
        if lobby_id not in cls._game_tasks:
            cls._game_tasks[lobby_id].cancel()
        cls._games.pop(lobby_id, None)
        cls._game_tasks.pop(lobby_id, None)
        cls._locks.pop(lobby_id, None)


import asyncio
import json
import uuid
import redis.asyncio as redis
import logging
from game_logic.game_objects import GameState, Player

logger = logging.getLogger(__name__)

# Global lock
matchmaking_lock = asyncio.Lock()

async def attempt_matchmaking(channel_layer):
    logger.info("Attempting matchmaking...")
    async with matchmaking_lock:
        r = redis.Redis(host='127.0.0.1', port=6379, db=0)
        length = await r.llen("matchmaking_queue")
        logger.debug(f"Current matchmaking queue length: {length}")
        if length >= 2:
            # Attempt to match up to half the queue (each match uses 2 players)
            for _ in range(length // 2):
                player1_data_json, player2_data_json = await pop_two_players(r)
                if player1_data_json and player2_data_json:
                    player1_data = json.loads(player1_data_json)
                    player2_data = json.loads(player2_data_json)
                    game_id = str(uuid.uuid4())

                    await r.set(f"game_state:{game_id}", json.dumps(
                        create_initial_game_state(game_id, player1_data, player2_data).serialize()
                    ))

                    logger.info(f"Matched players {player1_data['player_id']} and {player2_data['player_id']} in game {game_id}")
                    await notify_players(channel_layer, game_id, player1_data, player2_data)
                else:
                    # If unable to pop two players, break out of the loop
                    break

async def pop_two_players(r):
    player1_data = await r.lpop("matchmaking_queue")
    player2_data = await r.lpop("matchmaking_queue")
    # If not enough players, push one back if popped
    if player1_data and not player2_data:
        await r.lpush("matchmaking_queue", player1_data)
    return player1_data, player2_data

async def notify_players(channel_layer, game_id, player1_data, player2_data):
    await channel_layer.group_send(
        f"user_{player1_data['player_id']}",
        {
            'type': 'match_found',
            'message': {
                'game_id': game_id,
                'player_id': player1_data['player_id'],
                'opponent': player2_data['username']
            }
        }
    )
    await channel_layer.group_send(
        f"user_{player2_data['player_id']}",
        {
            'type': 'match_found',
            'message': {
                'game_id': game_id,
                'player_id': player2_data['player_id'],
                'opponent': player1_data['username']
            }
        }
    )

def create_initial_game_state(game_id, player1_data, player2_data):
    return GameState(
        game_id,
        create_player_object(player1_data, 'left'),
        create_player_object(player2_data, 'right')
    )


def create_player_object(player_data, side):
    is_registered = True if player_data['user_id'] else False
    user_id = player_data['user_id'] if is_registered else None
    return Player(
        player_data['player_id'],
        player_data['username'],
        is_registered,
        user_id,
        side
    )
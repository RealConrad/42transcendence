import asyncio
import json
import uuid
import redis.asyncio as redis
import logging

logger = logging.getLogger(__name__)

matchmaking_lock = asyncio.Lock()  # Initialize a global lock

async def attempt_matchmaking(channel_layer):
    logger.info("Attempting matchmaking...")
    async with matchmaking_lock:  # Acquire the lock
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

                    await r.set(f"game_state:{game_id}", json.dumps({}))

                    # Notify players of the match
                    logger.info(f"Matched players {player1_data['player_id']} and {player2_data['player_id']} in game {game_id}")
                    await notify_players(channel_layer, game_id, player1_data, player2_data)
                else:
                    # If unable to pop two players, break out of the loop
                    break

async def pop_two_players(r):
    """
    Atomically pops two players from the queue.
    """
    player1_data = await r.lpop("matchmaking_queue")
    player2_data = await r.lpop("matchmaking_queue")
    # If not enough players, push one back if popped
    if player1_data and not player2_data:
        await r.lpush("matchmaking_queue", player1_data)
    return player1_data, player2_data

async def notify_players(channel_layer, game_id, player1_data, player2_data):
    """
    Send match notifications to both players.
    """
    await channel_layer.group_send(
        f"user_{player1_data['player_id']}",
        {
            'type': 'match_found',
            'message': {'game_id': game_id, 'opponent': player2_data['username']}
        }
    )
    await channel_layer.group_send(
        f"user_{player2_data['player_id']}",
        {
            'type': 'match_found',
            'message': {'game_id': game_id, 'opponent': player1_data['username']}
        }
    )

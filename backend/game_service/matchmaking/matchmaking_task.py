import asyncio
import json
import uuid
import redis.asyncio as redis
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User
from common.models import GameLobby, Player
import logging

logger = logging.getLogger(__name__)

async def matchmaking_task(channel_layer):
    logger.info("Starting matchmaking task...")
    r = redis.Redis(host='127.0.0.1', port=6379, db=0)
    while True:
        length = await r.llen("matchmaking_queue")
        logger.debug(f"Current matchmaking queue length: {length}")
        if length >= 2:
            # Try to match up to half the queue (each match uses 2 players)
            for _ in range(length // 2):
                player1_data_json, player2_data_json = await pop_two_players(r)
                if player1_data_json and player2_data_json:
                    player1_data = json.loads(player1_data_json)
                    player2_data = json.loads(player2_data_json)
                    game_id = str(uuid.uuid4())

                    # Create a game if either player is registered
                    await create_game_if_needed(game_id, player1_data, player2_data)

                    # Notify players of the match
                    logger.info(f"Matched players {player1_data['player_id']} and {player2_data['player_id']} in game {game_id}")
                    await notify_players(channel_layer, game_id, player1_data, player2_data)
                else:
                    # If unable to pop two players, break out of the loop
                    break
        await asyncio.sleep(1)

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

async def create_game_if_needed(game_id, player1_data, player2_data):
    """
    Creates a game lobby in the database if either player is registered.
    """
    logger.debug(f"Creating game if needed for game_id: {game_id}")
    player1_user = None
    player2_user = None
    if 'user_id' in player1_data and player1_data['user_id']:
        player1_user = await sync_to_async(User.objects.get)(id=player1_data['user_id'])
    if 'user_id' in player2_data and player2_data['user_id']:
        player2_user = await sync_to_async(User.objects.get)(id=player2_data['user_id'])

    if player1_user or player2_user:
        # Retrieve Player model instances
        player1 = await sync_to_async(Player.objects.get)(user=player1_user) if player1_user else None
        player2 = await sync_to_async(Player.objects.get)(user=player2_user) if player2_user else None

        # Create the game lobby
        await sync_to_async(GameLobby.objects.create)(
            game_id=game_id,
            player1=player1,
            player2=player2,
            player1_username=player1_data['username'] if not player1_user else None,
            player2_username=player2_data['username'] if not player2_user else None
        )
        logger.debug(f"Game lobby created for game_id: {game_id}")

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

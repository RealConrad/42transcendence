import json
import uuid
import logging
import redis.asyncio as redis
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from game_service.utils import verify_token_with_auth_service
from .tasks import attempt_matchmaking

logger = logging.getLogger(__name__)

class MatchmakingConsumer(AsyncWebsocketConsumer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.redis = None
        # Unique identifier for this connection, temporary for redis to identify different players
        self.player_id = str(uuid.uuid4())
        self.username = None
        self.user = None

    async def connect(self):
        await self.accept()
        # Create Redis connection
        self.redis = redis.Redis(host='127.0.0.1', port=6379, db=0)
        # Add the player's channel to their personal group
        group_name = f"user_{self.player_id}"
        await self.channel_layer.group_add(group_name, self.channel_name)
        logger.debug(f"Player connected and added to group {group_name}: {self.player_id}")

    async def disconnect(self, code):
        if self.redis:
            await self.remove_from_queue()  # Ensure player is removed from the queue if present
            await self.redis.close()
        # Remove from personal group
        group_name = f"user_{self.player_id}"
        await self.channel_layer.group_discard(group_name, self.channel_name)
        logger.debug(f"Player disconnected and removed from group {group_name}: {self.player_id} with code {code}")

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'join_queue':
            await self.handle_join_queue(data)
        elif action == 'leave_queue':
            await self.handle_leave_queue()

    async def handle_join_queue(self, data):
        username = data.get('username', f'Guest_{self.player_id[:8]}')
        token = data.get('token')

        # Determine if user is registered or a guest
        if token:  # For registered users
            user_info = await sync_to_async(verify_token_with_auth_service)(token)
            if user_info:
                try:
                    self.user = await sync_to_async(User.objects.get)(id=user_info['user_id'])
                    self.username = self.user.username
                    logger.debug(f"Registered player joined queue: {self.username} (ID: {self.player_id})")
                except User.DoesNotExist:
                    await self.send(json.dumps({'error': 'User not found'}))
                    await self.close(code=400)
                    logger.error("User not found for matchmaking")
                    return
            else:
                await self.send(json.dumps({'error': 'Invalid token'}))
                await self.close(code=400)
                logger.error("Invalid token provided for matchmaking")
                return
        else:  # Guest player
            self.username = username
            logger.debug(f"Guest player joined queue: {self.username} (ID: {self.player_id})")

        # Add player to queue
        await self.enqueue_player()

    async def enqueue_player(self):
        player_data = self.get_player_data()
        player_data_json = json.dumps(player_data)
        # Add player to the queue
        await self.redis.rpush('matchmaking_queue', player_data_json)
        await self.send(json.dumps({'status': 'waiting_in_queue'}))
        logger.debug(f"Player {self.player_id} enqueued for matchmaking with data: {player_data}")

        # Attempt matchmaking each time a new player joins
        await attempt_matchmaking(self.channel_layer)

    async def handle_leave_queue(self):
        # Remove player from queue if present
        await self.remove_from_queue()
        await self.send(json.dumps({'status': 'left_queue'}))
        logger.debug(f"Player {self.player_id} requested to leave queue")

    async def remove_from_queue(self):
        player_data = self.get_player_data()
        player_data_json = json.dumps(player_data)
        # Remove player from the queue
        await self.redis.lrem('matchmaking_queue', 0, player_data_json)
        logger.debug(f"Player {self.player_id} removed from matchmaking queue")

    def get_player_data(self):
        return {
            'player_id': self.player_id,
            'username': self.username,
            'user_id': self.user.id if self.user else None
        }

    async def match_found(self, event):
        """Handles the 'match_found' event and sends data to the frontend."""
        logger.debug(f"Match found event for player {self.player_id} with data: {event['message']}")
        message = event['message']
        await self.send(json.dumps({
            'type': 'match_found',
            'message': message
        }))
        logger.info(f"Notified player {self.player_id} about the match {message['game_id']}")

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from matchmaking import routing as matchmaking_socket_routing
from game_socket.routing import websocket_urlpatterns as game_socket_urlpatterns
import asyncio
import threading
from channels.layers import get_channel_layer
from matchmaking.matchmaking_task import matchmaking_task

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_service.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            matchmaking_socket_routing.websocket_urlpatterns + game_socket_urlpatterns
        )
    ),
})

# Start the background matchmaking task in a separate thread
def start_matchmaking_task():
    asyncio.run(matchmaking_task(get_channel_layer()))

thread = threading.Thread(target=start_matchmaking_task, daemon=True)
thread.start()
print("Background matchmaking task has been started in a separate thread.")
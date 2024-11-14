import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from matchmaking.routing import websocket_urlpatterns as matchmaking_socket_routing
from game_logic.routing import websocket_urlpatterns as game_socket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_service.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            matchmaking_socket_routing + game_socket_urlpatterns
        )
    ),
})

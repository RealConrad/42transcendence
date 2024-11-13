import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from matchmaking import routing as matchmaking_socket_routing
from game_socket.routing import websocket_urlpatterns as game_socket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_service.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            matchmaking_socket_routing.websocket_urlpatterns + game_socket_urlpatterns
        )
    ),
})

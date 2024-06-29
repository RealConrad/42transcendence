"""
ASGI config for game_service project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from matchmaking_socket import routing as matchmaking_socket_routing


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game_service.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            matchmaking_socket_routing.websocket_urlpatterns
        )
    ),
})

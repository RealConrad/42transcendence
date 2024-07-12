from django.urls import path
from .consumers import MatchmakingConsumer

websocket_urlpatterns = [
    path('ws/matchmaking/', MatchmakingConsumer.as_asgi()),
    # TODO: Create the other game modes as different socket connections
]

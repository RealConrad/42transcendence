from django.db import models
from django.contrib.auth.models import User
import uuid

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username

class GameLobby(models.Model):
    player1 = models.ForeignKey(Player, null=True, blank=True, related_name='games_as_player1', on_delete=models.SET_NULL)
    player2 = models.ForeignKey(Player, null=True, blank=True, related_name='games_as_player2', on_delete=models.SET_NULL)
    player1_username = models.CharField(max_length=150, null=True, blank=True)
    player2_username = models.CharField(max_length=150, null=True, blank=True)
    state = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    game_id = models.UUIDField(default=uuid.uuid4, editable=False)

    def __str__(self):
        return f"Game between {self.get_player1_display()} and {self.get_player2_display()}"

    def get_player1_display(self):
        return self.player1.user.username if self.player1 else self.player1_username

    def get_player2_display(self):
        return self.player2.user.username if self.player2 else self.player2_username

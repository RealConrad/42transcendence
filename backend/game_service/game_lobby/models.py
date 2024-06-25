from django.db import models
from django.contrib.auth.models import User


class GameLobby(models.Model):
    player1 = models.ForeignKey(User, related_name='player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='player2', on_delete=models.CASCADE, null=True, blank=True)
    state = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_full(self):
        return self.player2 is not None


class GameQueue(models.Model):
    player = models.OneToOneField(User, related_name='player', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


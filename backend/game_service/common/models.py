from django.db import models


class GameLobby(models.Model):
    player1 = models.CharField(max_length=150)
    player2 = models.CharField(max_length=150)
    state = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_full(self):
        return self.player2 is not None


class GuestUser(models.Model):
    username = models.CharField(max_length=150, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)


class GameQueue(models.Model):
    player = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)

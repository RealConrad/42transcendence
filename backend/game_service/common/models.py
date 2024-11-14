import uuid
from django.db import models

class GameLobby(models.Model):
    # These fields will be set with User ID (if registered user)
    player1_user_id = models.CharField(null=True, blank=True)
    player2_user_id = models.CharField(null=True, blank=True)
    # Display purposes only, also for Guest users
    player1_username = models.CharField(max_length=150, null=True, blank=True)
    player2_username = models.CharField(max_length=150, null=True, blank=True)
    # Store final game state data after game completes
    state = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    game_id = models.UUIDField(default=uuid.uuid4, editable=False)

    def __str__(self):
        return f"Game ID {self.game_id} between {self.get_player1_display()} and {self.get_player2_display()}"

    def get_player1_display(self):
        return f"User ID: {self.player1_user_id}" if self.player1_user_id else self.player1_username

    def get_player2_display(self):
        return f"User ID: {self.player2_user_id}" if self.player2_user_id else self.player2_username

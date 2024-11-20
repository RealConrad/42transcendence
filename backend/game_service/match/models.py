from django.core.exceptions import ValidationError

from django.db import models

class Match(models.Model):
    user_id = models.IntegerField()
    player1_username = models.CharField(max_length=200)
    player2_username = models.CharField(max_length=200)
    winner = models.CharField(max_length=200)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.player1_score > self.player2_score:
            self.winner = self.player1_username
        elif self.player1_score < self.player2_score:
            self.winner = self.player2_username
        else:
            raise ValidationError("Invalid scores. Unable to determine winner")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Match: {self.player1_username} vs {self.player2_username}: {self.player1_score} - {self.player2_score}"

    def clean(self):
        if self.player1_username == self.player2_username:
            raise ValidationError("Player 2 cannot have the same name as player 1")

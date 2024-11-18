from django.db import models

class Match(models.Model):
    user_id = models.IntegerField()
    player1_username = models.CharField(max_length=200)
    player2_username = models.CharField(max_length=200)
    winner = models.CharField(max_length=200)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    duration = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Match: {self.player1_username} vs {self.player2_username}: {self.player1_score} - {self.player2_score}"

from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    tournaments_played = models.IntegerField(default=0)
    tournaments_won = models.IntegerField(default=0)

    def __str__(self):
        return f"UserProfile: {self.user.username}"

    def increment_tournaments_played(self):
        self.tournaments_played += 1
        self.save()

    def increment_tournaments_won(self):
        self.tournaments_won += 1
        self.save()

class Match(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matches", null=True)
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

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    mfa_enabled = models.BooleanField(default=False)
    total_matches_won = models.IntegerField(default=0)
    total_matches_lost = models.IntegerField(default=0)

    def __str__(self):
        return self.username
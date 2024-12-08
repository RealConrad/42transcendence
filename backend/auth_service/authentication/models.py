from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    mfa_enabled = models.BooleanField(default=False)
    logged_in = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    profile_picture_url = models.URLField(max_length=500, null=True, blank=True)
    display_name = models.CharField(max_length=50, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.display_name:
            self.display_name = self.username
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class UserProfile(models.Model):
    """
    Extended user profile with additional attributes
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/default.jpg')
    profile_picture_url = models.URLField(max_length=500, null=True, blank=True)
    online = models.BooleanField(default=False) # Online status

    def __str__(self):
        return f"{self.user.username}'s profile"

class FriendRequest(models.Model):
    """
    Model to represent requests between users.
    """
    STATUS_CHOICES = (
        ('pending', 'pending'),
        ('accepted', 'accepted'),
        ('declined', 'declined'),
    )

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receiver')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"Request from {self.sender.username} to {self.receiver.username} in status {self.status}"


class Friendship(models.Model):
    """
    Model to represent friendship between users.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship')
    friends = models.ManyToManyField(User, related_name='friend_of', blank=True)

    def __str__(self):
        return f"{self.user.username}'s friendship"
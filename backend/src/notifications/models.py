from django.db import models
from users.models import User
from django.utils import timezone
import uuid


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('alert_created', 'Alert Created'),
        ('alert_updated', 'Alert Updated'),
        ('alert_nearby', 'Nearby Alert'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    related_alert = models.ForeignKey('alerts.Alert', on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"
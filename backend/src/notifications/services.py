# notifications/services.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationService:
    @staticmethod
    def send_notification_to_user(user_id, notification_data):
        channel_layer = get_channel_layer()
        
        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}_notifications',
            {
                'type': 'send_notification',
                'notification': notification_data
            }
        )

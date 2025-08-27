from django.urls import re_path
from . import consumers
from .middleware import WebSocketAuthMiddleware

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', WebSocketAuthMiddleware(consumers.NotificationsConsumer.as_asgi())),
]
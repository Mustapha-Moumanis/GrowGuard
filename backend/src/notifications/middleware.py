# notifications/middleware.py (simplified version)
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
import jwt
from django.conf import settings
from rest_framework.authtoken.models import Token
import logging
User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_key):
    try:
        # Try to get user from token (for rest_framework.authtoken)
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        try:
            # Try to decode JWT token (for dj_rest_auth)
            decoded = jwt.decode(token_key, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded.get('user_id')
            if user_id:
                return User.objects.get(id=user_id)
        except (jwt.InvalidTokenError, User.DoesNotExist, jwt.DecodeError):
            pass
    return AnonymousUser()

class WebSocketAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        # Parse query string from scope - this is the most reliable method
        query_string = parse_qs(scope.get('query_string', b'').decode())
        logger = logging.getLogger(__name__)
        # Get token from query parameters
        tokens = query_string.get('token', [])
        
        if tokens:
            token = tokens[0]
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
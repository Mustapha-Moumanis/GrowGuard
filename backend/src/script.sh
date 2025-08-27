#!/bin/bash

set -e

python ./manage.py makemigrations
python ./manage.py migrate

# Check if admin user exists
EXISTS=$(python ./manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
print(User.objects.filter(username='${DJANGO_SUPERUSER_USERNAME}', is_superuser=True).exists())
" 2>/dev/null)

if [ "$EXISTS" = "False" ]; then
    echo "Creating superuser..."
    python ./manage.py createsuperuser --noinput
    
    # Update email if provided
    if [ ! -z "$DJANGO_SUPERUSER_EMAIL" ]; then
        python ./manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(username='${DJANGO_SUPERUSER_USERNAME}')
    user.email = '${DJANGO_SUPERUSER_EMAIL}'
    user.save()
    print('Email updated successfully')
except User.DoesNotExist:
    print('User not found')
except Exception as e:
    print(f'Error updating email: {e}')
" 2>/dev/null
    fi
else
    echo "Superuser already exists"
fi

# Start the server
exec python manage.py runserver 0.0.0.0:8000
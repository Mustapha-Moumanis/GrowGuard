from django.db import models
from users.models import User
import uuid
from notifications.services import NotificationService
from math import radians, cos, sin, asin, sqrt


class AlertManager(models.Manager):
    def haversine(self, lon1, lat1, lon2, lat2):
        """
        Calculate the great-circle distance between two points
        """
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a)) 
        return c * 6371  # Earth's radius in km

    def get_nearby_users(self, latitude, longitude, radius_km, max_results=100):
        """
        Find users within a given radius using pure Python
        """
        nearby_users = []
        
        # Get all users with location data
        users_with_location = User.objects.filter(
            latitude__isnull=False, 
            longitude__isnull=False
        ).exclude(latitude=0, longitude=0)  # Exclude invalid coordinates
        
        for user in users_with_location:
            try:
                distance = self.haversine(
                    longitude, latitude,
                    user.longitude, user.latitude
                )
                
                if distance <= radius_km:
                    user.distance_km = distance  # Add distance as attribute
                    nearby_users.append(user)
                    
                    # Limit results for performance
                    if len(nearby_users) >= max_results:
                        break
                        
            except (TypeError, ValueError):
                continue
        
        return nearby_users

class Alert(models.Model):
    SEVERITY_CHOICES = [
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High"),
        ("Critical", "Critical"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    crop = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    address = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.FloatField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    objects = AlertManager()

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        # Trigger notifications only on creation
        if is_new:
            self.send_alert_notifications()
    
    def get_nearby_farmers(self, max_results=50):
        """
        Get farmers within the alert radius who grow the relevant crop
        """
        # Get all nearby users
        nearby_users = Alert.objects.get_nearby_users(
            self.latitude, self.longitude, self.radius, max_results
        )
        
        # Filter for farmers who grow this crop (if specified)
        if self.crop:
            relevant_farmers = []
            for user in nearby_users:
                # Check if user grows this crop (assuming crops is a list)
                user_crops = getattr(user, 'crops', [])
                if not user_crops or self.crop.lower() in [c.lower() for c in user_crops]:
                    relevant_farmers.append(user)
            return relevant_farmers
        
        return nearby_users

    def send_alert_notifications(self):
        from django.utils import timezone
        from notifications.models import Notification
        
        # 1. Send notification to alert author
        author_notification = Notification.objects.create(
            user=self.author,
            title=f"✅ Alert Created: {self.title}",
            message=f"Your {self.severity} alert for {self.crop} has been created successfully.",
            notification_type='alert_created',
            related_alert=self
        )
        
        NotificationService.send_notification_to_user(
            self.author.id,
            self._create_notification_data(author_notification)
        )
        
        # 2. Send notifications to nearby farmers
        nearby_farmers = self.get_nearby_farmers()
        
        print(f"📢 Sending alert to {len(nearby_farmers)} nearby farmers")
        
        for farmer in nearby_farmers:
            distance_km = getattr(farmer, 'distance_km', None)
            
            farmer_notification = Notification.objects.create(
                user=farmer,
                title=f"🌱 Alert Nearby: {self.title}",
                message=self._create_farmer_message(farmer, distance_km),
                notification_type='alert_nearby',
                related_alert=self
            )
            
            NotificationService.send_notification_to_user(
                farmer.id,
                self._create_notification_data(farmer_notification, farmer, distance_km)
            )

    def _create_farmer_message(self, farmer, distance_km):
        """Create personalized message for each farmer"""
        base_message = f"New {self.severity} alert for {self.crop}"
        
        if distance_km is not None:
            base_message += f" ({distance_km:.1f}km from you)"
        
        if self.description:
            base_message += f": {self.description[:100]}..."
        
        return base_message

    def _create_notification_data(self, notification, user=None, distance_km=None):
        """Create notification data structure"""
        data = {
            'id': str(notification.id),
            'title': notification.title,
            'message': notification.message,
            'type': notification.notification_type,
            'alert_id': str(self.id),
            'alert_title': self.title,
            'alert_severity': self.severity,
            'alert_crop': self.crop,
            'alert_category': self.category,
            'created_at': notification.created_at.isoformat(),
            'is_read': notification.is_read
        }
        
        if user and distance_km is not None:
            data['distance_km'] = round(distance_km, 2)
            data['farmer_username'] = user.username
        
        return data

    @property
    def location(self):
        """Return as tuple for easy use"""
        return (self.latitude, self.longitude)
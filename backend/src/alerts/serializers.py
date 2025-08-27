from rest_framework import serializers
from math import radians, cos, sin, asin, sqrt
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()
    is_within_radius = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = [
            'id', 'title', 'description', 'crop', 'address',
            'latitude', 'longitude', 'severity', 'date', 'author',
            'category', 'radius', 'distance', 'is_within_radius'  
        ]
        read_only_fields = ['author', 'distance', 'is_within_radius']

    def haversine(self, lon1, lat1, lon2, lat2):
        """
        Calculate the great-circle distance (in km) between two points 
        on Earth using their longitude and latitude (in decimal degrees).
        """
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a)) 
        r = 6371  # Earth's radius in km
        return c * r

    def get_distance(self, obj):
        """Calculate distance from user's location if provided in context"""
        request = self.context.get('request')
        if request and hasattr(request, 'user_lat') and hasattr(request, 'user_lng'):
            distance_km = self.haversine(
                request.user_lng, request.user_lat,
                obj.longitude, obj.latitude
            )
            return round(distance_km, 2)
        return None

    def get_is_within_radius(self, obj):
        """Check if the user is inside the alert's radius (in km)"""
        request = self.context.get('request')
        if request and hasattr(request, 'user_lat') and hasattr(request, 'user_lng'):
            distance_km = self.haversine(
                request.user_lng, request.user_lat,
                obj.longitude, obj.latitude
            )
            return distance_km <= obj.radius  # True if user is within radius
        return False

    def create(self, validated_data):
        """Assign the logged-in user as the author of the alert."""
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)

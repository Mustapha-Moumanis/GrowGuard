from django.db import models

# Create your models here.
import os
import random

from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.contrib.gis.db import models as geomodels

def GenerateProfileImagePath(instance, filename):
    ext = filename.split('.')[-1]
    path = f'static/accounts/{instance.id}/images/'
    name = f'profile_image.{ext}'
    return os.path.join(path, name)

class User(AbstractUser):
    class Roles(models.TextChoices):
        Farmer = "Farmer", "Farmer"
        Agronomist = "Agronomist", "Agronomist"
    
    avatar = models.ImageField(upload_to=GenerateProfileImagePath, max_length=200, blank=True, null=True)
    reset_password_pin = models.CharField(max_length=256, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Roles.choices, null=True, blank=True)

    # Location

    country = models.CharField(max_length=100, null=True, blank=True)
    region = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def assign_default_avatar(self):
        if self.role == self.Roles.Farmer:
            return f"static/default/farmer.png"
        elif self.role == self.Roles.Agronomist:
            return f"static/default/agronomist.png"
        return None
    
    def save(self, *args, **kwargs):
        if not self.avatar:
            default_path = self.assign_default_avatar()
            if default_path:
                self.avatar.name = default_path
        super().save(*args, **kwargs)
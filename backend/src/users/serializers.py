from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import LoginSerializer, UserDetailsSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import check_password
from .models import User
import re

# Login
class CustomLoginSerializer(LoginSerializer):
	username = None

# Register
from allauth.account.adapter import get_adapter
from allauth.account import app_settings as allauth_account_settings

class CustomRegisterSerializer(RegisterSerializer):
    """
    Custom serializer for user registration.
    This serializer extends the default RegisterSerializer to include additional fields.
    """

    role = serializers.ChoiceField(choices=["Farmer", "Agronomist"])
      
    def custom_signup(self, request, user):
      user.role = self.validated_data.get('role')
      user.save()
      return user

# User Details

from django.core.validators import URLValidator, ValidationError
from dateutil.relativedelta import relativedelta
from datetime import date

class MyUserDetailsSerializer(UserDetailsSerializer):
	class Meta:
		model = User
		fields = ['username', 'email', 'first_name', 'last_name', 'avatar', 'role', 'country', 'region', 'city', 'latitude', 'longitude']
		read_only_fields = ('email', 'role')

	def validate_username(self, username):
		pattern = r'^[a-zA-Z][a-zA-Z_-]{0,19}$'
		if not re.match(pattern, username):
			raise serializers.ValidationError('invalid username')
		return username

	# def validate_first_name(self, first_name):
	# 	pattern = r'^[a-zA-Z][a-zA-Z_-]{0,19}$'
	# 	if not re.match(pattern, first_name):
	# 		raise serializers.ValidationError('invalid first name')
	# 	return first_name

	# def validate_last_name(self, last_name):
	# 	pattern = r'^[a-zA-Z][a-zA-Z_-]{0,19}$'
	# 	if not re.match(pattern, last_name):
	# 		raise serializers.ValidationError('invalid last name')
	# 	return last_name

	# def to_representation(self, instance):
	# 	representation = super().to_representation(instance)
	# 	avatar_field = instance.avatar
	# 	if avatar_field:
	# 		try:
	# 			representation['avatar'] = avatar_field.url
	# 		except (AttributeError, ValueError):
	# 			representation['avatar'] = str(avatar_field)
	# 	else:
	# 		representation['avatar'] = None
	# 	return representation

# Verify Email

class CustomVerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    key = serializers.CharField()

# Password reset

from .forms import MyAllAuthPasswordResetForm

class MyPasswordResetSerializer(PasswordResetSerializer):

	@property
	def password_reset_form_class(self):
		return MyAllAuthPasswordResetForm

# Password Reset Confirm

from rest_framework.exceptions import ValidationError

class MyPasswordResetConfirmSerializer(PasswordResetConfirmSerializer):
	uid = None
	email = serializers.CharField()

	class Meta:
		fields = ["new_password1", "new_password2", "email", "token"]

	def validate(self, attrs):
		try:
			self.user = User._default_manager.get(email=attrs['email'])
		except (TypeError, ValueError, OverflowError, User.DoesNotExist):
			raise ValidationError({'email': [_('Invalid value')]})
		if not check_password(attrs['token'], self.user.reset_password_pin):
			raise ValidationError({'token': [_('Invalid value')]})

		self.set_password_form = self.set_password_form_class(
			user=self.user, data=attrs,
		)
		if not self.set_password_form.is_valid():
			raise serializers.ValidationError(self.set_password_form.errors)
		
		self.custom_validation(attrs)
		
		self.user.reset_password_pin = ""
		self.user.save()
		
		return attrs

	def save(self):
		return self.set_password_form.save()

# User Location

class UserLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['country', 'region', 'city', 'latitude', 'longitude']


# from django.contrib.gis.geos import Point

# class UserLocationSerializer(serializers.ModelSerializer):
#     latitude = serializers.FloatField(write_only=True, required=True)
#     longitude = serializers.FloatField(write_only=True, required=True)

#     class Meta:
#         model = User
#         fields = ['latitude', 'longitude']

#     def update(self, instance, validated_data):
#         lat = validated_data.pop('latitude')
#         lng = validated_data.pop('longitude')
#         instance.location = Point(lng, lat)
#         instance.save()
#         return instance
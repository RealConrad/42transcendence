from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

# Inherit from ModelSerializer
class RegisterSerializer(serializers.ModelSerializer):
	# Meta class specifies which model to use and which fields to include in the serialized output
	class Meta:
		model = User
		fields = ('email', 'username', 'password')
		extra_kwargs = {'password': {'write_only': True}}

	def validate_email(self, value):
		if User.objects.filter(email=value).exists():
			raise serializers.ValidationError("This email is already in use")
		return value

	# Create a new user
	def create(self, validated_data):
		user = User.objects.create_user(
			email=validated_data['email'],
			username=validated_data['username'],
			password=validated_data['password']
		)
		return user

class LoginSerializer(serializers.Serializer):
	username = serializers.CharField()
	password = serializers.CharField(write_only=True)

	def validate(self, data):
		user = authenticate(username=data['username'], password=data['password'])
		if user and user.is_active:
			return user
		raise serializers.ValidationError("Invalid credentials")

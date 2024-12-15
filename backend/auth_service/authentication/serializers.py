from django.contrib.auth.validators import UnicodeUsernameValidator
from .models import CustomUser
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import re

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=150, validators=[UnicodeUsernameValidator()])
    password = serializers.CharField(write_only=True, validators=[validate_password])
    class Meta:
        model = CustomUser
        fields = ('username', 'password')

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data.get('username'),
            password=data.get('password')
        )
        if user and user.is_active:
            return {'user': user}
        raise serializers.ValidationError("Invalid credentials")

class UpdateDisplayNameSerializer(serializers.Serializer):
    displayname = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
        error_messages={
            'blank': "Display name cannot be blank.",
            'max_length': "Display name must not exceed 50 characters.",
            'min_length': "Display name must be at least 3 characters long."
        }
    )

    def validate_displayname(self, value):
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError("Display name can only contain alphabets, numbers and underscore")
        return value
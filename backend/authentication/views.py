from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer

"""
In Django REST Framework (DRF), the views generally return a Response object instead of the standard Django HttpResponse.
The Response object provided by DRF is specifically designed to return content that will be rendered into
JSON or another content type
"""

class RegisterView(generics.CreateAPIView):
	# These variables are used by the parent class 'generics.CreateAPIView'
	queryset = User.objects.all() # Define the queryset for the view
	permission_classes = (permissions.AllowAny,) # Set permission for the view
	serializer_class = RegisterSerializer # Set the serializer class for the view

	# overrides the default behavior to provide a custom response.
	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data) # Uses serializer_class
		
		# Validate if the uesr credentials, this will return error codes
		serializer.is_valid(raise_exception=True)

		user = serializer.save() # Save the user
		refresh = RefreshToken.for_user(user) # Generates JWT tokens
		return Response({
			"user": {
				"username": user.username,
				"email": user.email
			},
			"refresh": str(refresh),
			"access": str(refresh.access_token),
			"message": "Created new user"
		}, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
	# These variables are used by the parent class 'generics.CreateAPIView'
	permission_classes = (permissions.AllowAny,)
	serializer_class = LoginSerializer

	def post(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.validated_data
		refresh = RefreshToken.for_user(user)
		return Response({
			'refresh': str(refresh),
			'access': str(refresh.access_token),
			'user': {
				'username': user.username,
				'email': user.email
			}
		}, status=status.HTTP_200_OK)

class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = (permissions.AllowAny,)

from django.urls import path
from .views import GenerateTokensView, VerifyTokenView, RefreshTokenView

urlpatterns = [
    path('generate-tokens/', GenerateTokensView.as_view(), name='generate_tokens'),
    path('verify/', VerifyTokenView.as_view(), name='verify_token'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh_token'),
]

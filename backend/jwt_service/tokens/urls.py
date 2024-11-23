from django.urls import path
from .views import GenerateTokensView, VerifyTokenView, RefreshTokenView

urlpatterns = [
    path('generate-tokens/', GenerateTokensView.as_view(), name='generate_tokens'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify_token'),
    path('refresh-token/', RefreshTokenView.as_view(), name='refresh_token'),
]

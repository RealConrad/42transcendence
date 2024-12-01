from django.urls import path
from .views import AuthorizeAPI, CallbackAPI

urlpatterns = [
    path('authorize/', AuthorizeAPI.as_view(), name='authorize'),
    path('callback/', CallbackAPI.as_view(), name='callback'),
]
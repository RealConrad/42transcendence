from multiprocessing.context import AuthenticationError
from rest_framework import serializers
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from match.models import Match
from match.serializers import MatchSerializer
import logging

logger = logging.getLogger(__name__)

class SaveMatchView(CreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            user_id = self.request.user.id
            logger.debug(f"Authenticated user ID: {user_id}")
            logger.debug(f"Request data: {self.request.data}")
            serializer.save(user_id=user_id)
        except serializers.ValidationError as e:
            logger.error(f"Serializer Validation Error: {e.detail}")
            raise
        except Exception as e:
            logger.error(f"Unexpected Error: {e}")
            raise

class MatchHistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MatchSerializer

    def get_queryset(self):
        user_id = self.request.user.id
        return Match.objects.filter(user_id=user_id)

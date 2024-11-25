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
            serializer.save(user_id=user_id)
        except serializers.ValidationError as e:
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

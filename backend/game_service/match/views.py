from multiprocessing.context import AuthenticationError
from rest_framework import serializers
from rest_framework.generics import CreateAPIView, ListAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Match, UserProfile
from .serializers import UserProfileSerializer, MatchSerializer
import logging
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import APIView


logger = logging.getLogger(__name__)

class SaveMatchView(CreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            user = self.request.user
            serializer.save(user=user)
            logger.info(f"Match successfully saved for user {user.username}")
        except serializers.ValidationError as e:
            raise
        except Exception as e:
            logger.error(f"Unexpected Error: {e}")
            raise

class UpdateTournamentStatusView(APIView):
    """
    Updates tournament stats for the user
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        action = request.data.get('action')
        profile = get_object_or_404(UserProfile, user=request.user)

        if action == 'played':
            profile.increment_tournaments_played()
        elif action == 'won':
            profile.increment_tournaments_won()
            profile.increment_tournaments_played()
        else:
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MatchHistoryView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MatchSerializer

    def get_queryset(self):
        return Match.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        profile = get_object_or_404(UserProfile, user=request.user)
        profile_serializer = UserProfileSerializer(profile)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        response_data = {
            "tournaments": profile_serializer.data,
            "games": serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)

from multiprocessing.context import AuthenticationError

from rest_framework.generics import GenericAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from rest_framework import status
from match.models import Match
from match.serializers import MatchSerializer
from match.utils import verify_token_with_auth_service


class IsAuthenticatedViaAuthService(BasePermission):
    def has_permission(self, request, view):
        token = request.headers.get("Authorization", "").split("Bearer ")[1]
        if not token:
            raise AuthenticationError("No token provided")
        user_data = verify_token_with_auth_service(token)
        request.user_id = user_data.get('user_id')
        if not request.user_id:
            raise AuthenticationError("No user_id found in token")
        return True

class SaveMatchView(CreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticatedViaAuthService]

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user_id)

class MatchHistoryView(APIView):
    serializer

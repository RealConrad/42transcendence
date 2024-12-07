from django.urls import path
from .views import SaveMatchView, MatchHistoryView, UpdateTournamentStatusView

urlpatterns = [
    path("save-match/", SaveMatchView().as_view(), name='save-match'),
    path("save-tournament/", UpdateTournamentStatusView().as_view(), name='save-tournament'),
    path("match-history/", MatchHistoryView().as_view(), name='match-history')
]
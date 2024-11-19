from django.urls import path

from match.views import SaveMatchView, MatchHistoryView

urlpatterns = [
    path("save-match/", SaveMatchView().as_view(), name='save-match'),
    path("match-history/", MatchHistoryView().as_view(), name='match-history')
]
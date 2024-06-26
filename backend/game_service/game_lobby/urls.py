from django.urls import path
from .views import FindMatchView, LeaveMatchQueueView

urlpatterns = [
    path("find-match/", FindMatchView.as_view(), name="find-match"),
    path("leave-queue/", LeaveMatchQueueView.as_view(), name="leave-queue"),
]

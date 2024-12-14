from django.urls import path
from .views import AddFriendView, AcceptFriendRequestView, DeclineFriendRequestView, GetFriendsListView, \
    UpdateProfilePictureAPIView, UpdateUserStatusAPIView, RemoveFriendAPIView

urlpatterns = [
    path('add/', AddFriendView.as_view(), name='add'),
    path('accept/', AcceptFriendRequestView.as_view(), name='accept'),
    path('decline/', DeclineFriendRequestView.as_view(), name='decline'),
    path('list/', GetFriendsListView.as_view(), name='list'),
    path('update-profile-pic-url/', UpdateProfilePictureAPIView.as_view(), name='update-profile-pic-url'),
    path('update_status/', UpdateUserStatusAPIView.as_view(), name='update_status'),
    path('remove/', RemoveFriendAPIView.as_view(), name='remove'),

]
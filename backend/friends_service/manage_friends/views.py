import requests
from django.shortcuts import render
from .models import FriendRequest, Friendship
from django.contrib.auth.models import User
from .serializers import FriendRequestSerializer, FriendshipSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, APIException, NotFound

# Create your views here.

class AddFriendView(generics.GenericAPIView):
    """
    API endpoint to send a friend request to another user
    """
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data, context={"request": request})

            serializer.is_valid(raise_exception=True)
            friend_request = serializer.save()

            return Response(
                self.get_serializer(friend_request).data,
                status=status.HTTP_201_CREATED
            )

        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)

        except APIException as e:
            return Response({"detail": e.detail}, status=status.HTTP_502_BAD_GATEWAY)

        except Exception as e:
            return Response({"detail": f"An unexpected error occurred: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AcceptFriendRequestView(generics.GenericAPIView):
    """
    API endpoint to accept friend request
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        sender_username = request.data.get('username')

        if not sender_username:
            raise ValidationError("Username of the friend is missing")

        try:
            sender = User.objects.get(username=sender_username)
        except User.DoesNotExist:
            raise ValidationError("The user does not exist. You are accepting a ghostly request!")

        try:
            friend_request = FriendRequest.objects.get(
                sender=sender, receiver=request.user, status="pending"
            )
        except FriendRequest.DoesNotExist:
            raise NotFound("Already Friend or No friend request found from the user")

        friend_request.status = "accepted"
        friend_request.save()

        sender_friendship, _ = Friendship.objects.get_or_create(user=friend_request.sender)
        receiver_friendship, _ = Friendship.objects.get_or_create(user=friend_request.receiver)

        sender_friendship.friends.add(friend_request.receiver)
        receiver_friendship.friends.add(friend_request.sender)

        return Response(
            {"detail": "Friend request accepted successfully."},
            status=status.HTTP_200_OK
        )


class DeclineFriendRequestView(generics.GenericAPIView):
    """
    API endpoint to decline friend request
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        sender_username = request.data.get('username')

        if not sender_username:
            raise ValidationError("You can unfriend someone without a name :(")

        try:
            sender = User.objects.get(username=sender_username)
        except User.DoesNotExist:
            raise ValidationError("The user does not exist. You are accepting a ghostly request!")

        try:
            friend_request = FriendRequest.objects.get(
                sender=sender, receiver=request.user, status="pending"
            )
        except FriendRequest.DoesNotExist:
            raise NotFound("Already Declined or No friend request found from the user")

        friend_request.status = "declined"
        friend_request.save()

        return Response(
            {"detail": "Friend request declined successfully."},
            status=status.HTTP_200_OK
        )


class GetFriendsListView(generics.GenericAPIView):
    """
    API endpoint to fetch list of friends
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        try:
            try:
                friendship = Friendship.objects.get(user=user)
                friends = friendship.friends.all()
                friends_usernames = [friend.username for friend in friends]
            except Friendship.DoesNotExist:
                friends_usernames = []


            sent_requests = FriendRequest.objects.filter(
                sender=user, status="pending"
            ).values_list('receiver__username', flat=True)

            received_requests = FriendRequest.objects.filter(
                receiver=user, status="pending"
            ).values_list('sender__username', flat=True)


            return Response(
                {
                    "friends": friends_usernames,
                    "pending": list(sent_requests),
                    "waiting": list(received_requests)
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

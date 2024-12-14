from rest_framework.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_400_BAD_REQUEST, HTTP_200_OK
from .models import FriendRequest, Friendship, UserProfile
from django.contrib.auth.models import User
from .serializers import FriendRequestSerializer, FriendshipSerializer
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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
            status=status.HTTP_201_CREATED
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
            status=status.HTTP_201_CREATED
        )


class GetFriendsListView(generics.GenericAPIView):
    """
    API endpoint to fetch list of friends
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        try:
            response_data = []

            # 1. Friends List
            try:
                friendship = Friendship.objects.get(user=user)
                friends = friendship.friends.all()
            except Friendship.DoesNotExist:
                friends = []

            for friend in friends:
                if not friend.profile.profile_picture_url:
                    profile_picture_url = (
                        request.build_absolute_uri(friend.profile.profile_picture.url)
                    )
                else:
                    profile_picture_url = friend.profile.profile_picture_url
                response_data.append({
                    "username": friend.username,
                    "status": "friends",
                    "profilePicture": profile_picture_url,
                    "online": "online" if friend.profile.online else "offline"
                })
            # friends_usernames = [friend.username for friend in friends]

            # 2. Pending Friends Request Sent
            sent_requests = FriendRequest.objects.filter(sender=user, status="pending")
            for sent_request in sent_requests:
                receiver = sent_request.receiver
                if not receiver.profile.profile_picture_url:
                    profile_picture_url = (
                        request.build_absolute_uri(receiver.profile.profile_picture.url)
                    )
                else:
                    profile_picture_url = receiver.profile.profile_picture_url
                response_data.append({
                    "username": receiver.username,
                    "status": "pending",
                    "profilePicture": profile_picture_url,
                    "online": "online" if receiver.profile.online else "offline"
                })

            # 3. Waiting Friend Requests Received
            received_requests = FriendRequest.objects.filter(receiver=user, status="pending")
            for received_request in received_requests:
                sender = received_request.sender
                if not sender.profile.profile_picture_url:
                    profile_picture_url = (
                        request.build_absolute_uri(sender.profile.profile_picture.url)
                    )
                else:
                    profile_picture_url = sender.profile.profile_picture_url
                response_data.append({
                    "username": sender.username,
                    "status": "waiting",
                    "profilePicture": profile_picture_url,
                    "online": "online" if sender.profile.online else "offline"
                })

            return Response(response_data , status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateProfilePictureAPIView(generics.GenericAPIView):
    """
    Updates user profile pic url
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):

        user = request.user
        profile_picture_url = request.data.get('profile_picture_url', None)
        if not profile_picture_url:
            return Response(
                {"detail": "No reference to new profile picture found"},
                status=HTTP_400_BAD_REQUEST
            )
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        user_profile.profile_picture_url = profile_picture_url
        user_profile.save()

        return Response({
            "username": user.username,
            "profile_picture_url": user_profile.profile_picture_url
        }, status=status.HTTP_200_OK)


class UpdateUserStatusAPIView(generics.GenericAPIView):
    """
    Updates User status to online or offline
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        user_status = request.data.get('status', None)

        if not status:
            return Response({
                "detail": "missing status value"
            }, status=status.HTTP_400_BAD_REQUEST
            )

        user_profile, created = UserProfile.objects.get_or_create(user=user)
        user_profile.online = user_status
        user_profile.save()

        return Response({
            "username": user.username,
            "detail": f"{user.username}'s status updated successfully",
            "status": user_status
        }, status=status.HTTP_200_OK)
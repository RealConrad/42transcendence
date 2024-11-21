from rest_framework import permissions

class IsOwnerAndNotDelete(permissions.BasePermission):
    """
    Allow only owners of an object to view or edit it, but disallow deletion.
    """

    def has_object_permission(self, request, view, obj):
        if request.method == "DELETE":
            return False

        return str(obj.user_id) == str(request.user.id)

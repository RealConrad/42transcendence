from django.utils.deprecation import MiddlewareMixin

class UpdateAccessTokenCookieMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if hasattr(request, '_new_access_token'):
            # Set the new access token in the cookie
            response.set_cookie(
                key='access_token',
                value=request._new_access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
            )
        return response

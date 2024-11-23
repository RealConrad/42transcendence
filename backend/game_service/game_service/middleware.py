class SetCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("__call__ was called")
        response = self.get_response(request)
        return self.process_response(request, response)

    def process_response(self, request, response):
        # Check if a new access token was set
        print("Checking if new cookies were set in middleware")
        if hasattr(request, 'new_access_token'):
            print("Setting new access token in cookies")
            response.set_cookie(
                key='access_token',
                value=request.new_access_token,
                httponly=True,
                secure=False,  # Set to True in production
                samesite='Lax',
            )
        if hasattr(request, 'new_refresh_token'):
            print("Setting new refresh token in cookies")
            response.set_cookie(
                key='refresh_token',
                value=request.new_refresh_token,
                httponly=True,
                secure=False,  # Set to True in production
                samesite='Lax',
            )
        return response
class SetCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return self.process_response(request, response)

    def process_response(self, request, response):
        if hasattr(request, 'new_access_token'):
            response.set_cookie(
                key='access_token',
                value=request.new_access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
            )
        if hasattr(request, 'new_refresh_token'):
            response.set_cookie(
                key='refresh_token',
                value=request.new_refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
            )
        return response
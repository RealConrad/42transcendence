from django.urls import path
from .views import RegisterView, LoginView, SetMFAFlagView, SaveProfilePicture

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('setmfaflag/', SetMFAFlagView.as_view(), name='setmfaflag'),
    path('save_profile_pic/', SaveProfilePicture.as_view(), name='save_profile_pic'),
]

from django.urls import path
from .views import LoginAPIView, RegisterUser, GetUserDetails

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('user/', GetUserDetails.as_view(), name='user_details')
]

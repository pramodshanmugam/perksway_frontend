from django.urls import path
from .views import LoginAPIView, RegisterUser

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
]

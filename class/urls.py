from django.urls import path
from .views import ClassListView, ClassCreateView, join_class

urlpatterns = [
    path('', ClassListView.as_view(), name='class_list'),
    path('create/', ClassCreateView.as_view(), name='class_create'),
    path('join/<str:class_code>/', join_class, name='join_class'),
]

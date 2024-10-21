from django.urls import path
from .views import ClassListView, ClassCreateView, join_class, GroupDetailView, AllGroupsInClassView

urlpatterns = [
    path('', ClassListView.as_view(), name='class_list'),
    path('create/', ClassCreateView.as_view(), name='class_create'),
    path('join/<str:class_code>/', join_class, name='join_class'),
    path('group/<int:group_id>/', GroupDetailView.as_view(), name='group_detail'),
    path('<int:class_id>/all-groups/', AllGroupsInClassView.as_view(), name='all_groups_in_class'),
]

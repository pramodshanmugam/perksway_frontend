from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Class
from .serializers import ClassSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# Custom permission to allow only teachers to create classes
class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'teacher'

# List all classes for authenticated users (students can view and join, teachers can view their own classes)
class ClassListView(generics.ListAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # If the user is a teacher, show only the classes they have created
        if user.role == 'teacher':
            return Class.objects.filter(teacher=user)
        # If the user is a student, show all classes
        return Class.objects.all()

# Create a class (only for teachers)
class ClassCreateView(generics.CreateAPIView):
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated, IsTeacher]

    def perform_create(self, serializer):
        # Automatically set the teacher to the logged-in user
        serializer.save(teacher=self.request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# API for students to join a class
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_class(request, class_code):
    try:
        class_to_join = Class.objects.get(class_code=class_code)
    except Class.DoesNotExist:
        return Response({'error': 'Class not found'}, status=404)

    if request.user.role == 'student':
        class_to_join.students.add(request.user)
        class_to_join.save()
        return Response({'message': 'Joined class successfully'})
    
    return Response({'error': 'Only students can join classes'}, status=403)

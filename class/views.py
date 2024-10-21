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


from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Class, Group
from .serializers import GroupSerializer
from django.shortcuts import get_object_or_404

class GroupDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, class_id):
        """Retrieve list of groups for the class where the user is present (either as a student or teacher)."""
        # Get the class object
        class_obj = get_object_or_404(Class, id=class_id)
        
        # Check if the user is the teacher of the class
        if request.user == class_obj.teacher:
            # If user is the teacher, return all groups of this class
            groups = Group.objects.filter(class_ref=class_obj)
        
        # Check if the user is a student in the class
        elif class_obj.students.filter(id=request.user.id).exists():
            # If user is a student, return all groups of this class
            groups = Group.objects.filter(class_ref=class_obj)
        
        else:
            # If the user is neither a teacher nor a student in the class, deny access
            return Response({"detail": "You are not a member of this class."}, status=status.HTTP_403_FORBIDDEN)
        
        # Serialize and return the group data
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, group_id):
        """Update group details (only by the creator)."""
        group = self.get_group(group_id, request.user)
        if not group:
            return Response({"detail": "Permission denied. You are not the creator of this group."}, status=status.HTTP_403_FORBIDDEN)

        serializer = GroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, group_id):
        """Delete group (only by the creator)."""
        group = self.get_group(group_id, request.user)
        if not group:
            return Response({"detail": "Permission denied. You are not the creator of this group."}, status=status.HTTP_403_FORBIDDEN)

        group.delete()
        return Response({"detail": "Group deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class AllGroupsInClassView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this API

    def get(self, request, class_id):
        """Retrieve all groups for a given class."""
        class_obj = get_object_or_404(Class, id=class_id)

        # Get all groups associated with this class
        groups = Group.objects.filter(class_ref=class_obj)
        serializer = GroupSerializer(groups, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
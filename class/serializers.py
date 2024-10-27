from rest_framework import serializers
from .models import Class, Group
from users.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'role']

class ClassSerializer(serializers.ModelSerializer):
    teacher = serializers.ReadOnlyField(source='teacher.email')  # Teacher's email will be read-only
    students = serializers.StringRelatedField(many=True, read_only=True)  # Student names in the response

    class Meta:
        model = Class
        fields = ['id', 'name', 'description', 'class_code', 'teacher', 'students']
        read_only_fields = ['teacher', 'students']

class GroupSerializer(serializers.ModelSerializer):
    students = UserSerializer(many=True, read_only=True)  # Display students in the response

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'class_ref', 'creator', 'students', 'created_at', 'updated_at']
        read_only_fields = ['creator', 'students']  # Make creator and students read-only

class GroupDetailSerializer(serializers.ModelSerializer):
    students = UserSerializer(many=True)  # Serialize the students as a nested field

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 'students']

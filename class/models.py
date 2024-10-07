from django.db import models
from django.conf import settings

class Class(models.Model):
    name = models.CharField(max_length=100)
    class_code = models.CharField(max_length=10, unique=True)  # Unique class code
    description = models.TextField(null=True, blank=True)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='classes')
    students = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_classes', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

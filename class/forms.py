from django import forms
from .models import Class

# Form for creating a class (used by teachers)
class ClassForm(forms.ModelForm):
    class Meta:
        model = Class
        fields = ['name', 'description']

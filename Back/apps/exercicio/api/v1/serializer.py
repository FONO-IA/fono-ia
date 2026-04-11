from rest_framework import serializers
from apps.exercicio.models import Exercicio


class ExercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercicio
        fields = '__all__'

from rest_framework import serializers
from apps.exercicio.models import Exercicio, ConteudoExercicio


class ConteudoExercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConteudoExercicio
        fields = ["id", "texto", "instrucao"]


class ExercicioSerializer(serializers.ModelSerializer):
    conteudos = ConteudoExercicioSerializer(many=True)

    class Meta:
        model = Exercicio
        fields = "__all__"

    def create(self, validated_data):
        conteudos_data = validated_data.pop("conteudos", [])
        exercicio = Exercicio.objects.create(**validated_data)

        for conteudo in conteudos_data:
            ConteudoExercicio.objects.create(
                exercicio=exercicio,
                **conteudo
            )

        return exercicio

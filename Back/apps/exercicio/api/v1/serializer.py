from rest_framework import serializers
from apps.exercicio.models import Exercicio, ConteudoExercicio


class ConteudoExercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConteudoExercicio
        fields = ["id", "texto", "instrucao"]


class ExercicioSerializer(serializers.ModelSerializer):
    conteudos = ConteudoExercicioSerializer(many=True, required=False)

    class Meta:
        model = Exercicio
        fields = "__all__"

    def create(self, validated_data):
        conteudos_data = validated_data.pop("conteudos", [])
        pacientes = validated_data.pop("paciente", [])

        exercicio = Exercicio.objects.create(**validated_data)

        if pacientes:
            exercicio.paciente.set(pacientes)

        for conteudo in conteudos_data:
            ConteudoExercicio.objects.create(
                exercicio=exercicio,
                **conteudo
            )

        return exercicio

    def update(self, instance, validated_data):
        conteudos_data = validated_data.pop("conteudos", None)
        pacientes = validated_data.pop("paciente", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if pacientes is not None:
            instance.paciente.set(pacientes)

        if conteudos_data is not None:
            instance.conteudos.all().delete()

            for conteudo in conteudos_data:
                ConteudoExercicio.objects.create(
                    exercicio=instance,
                    **conteudo
                )

        return instance
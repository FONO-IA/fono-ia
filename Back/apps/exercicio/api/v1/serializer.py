from rest_framework import serializers
from apps.exercicio.models import Exercicio, ConteudoExercicio


class ConteudoExercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConteudoExercicio
        fields = ["id", "texto", "instrucao"]


class ExercicioSerializer(serializers.ModelSerializer):
    conteudos = ConteudoExercicioSerializer(many=True, required=False)
    nivel_display = serializers.CharField(
        source='get_nivel_display', read_only=True
    )
    titulo = serializers.SerializerMethodField()
    descricao = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    dificuldade = serializers.CharField(source='nivel', read_only=True)
    prazo = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    referencia_url = serializers.SerializerMethodField()

    class Meta:
        model = Exercicio
        fields = "__all__"

    def get_titulo(self, obj):
        return obj.categoria

    def get_descricao(self, obj):
        return obj.objetivo

    def get_status(self, obj):
        return "concluido" if obj.concluido else "pendente"

    def get_prazo(self, obj):
        return None

    def get_audio_url(self, obj):
        return None

    def get_referencia_url(self, obj):
        return None

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

from rest_framework import serializers
from apps.paciente.models import Paciente


class PacienteSerializer(serializers.ModelSerializer):
    total_exercicios = serializers.SerializerMethodField()
    exercicios_concluidos = serializers.SerializerMethodField()
    ultima_sessao = serializers.SerializerMethodField()
    responsavel_nome = serializers.CharField(
        source='responsavel.nome', read_only=True
    )

    class Meta:
        model = Paciente
        fields = [
            'id',
            'nome',
            'data_nascimento',
            'observacoes',
            'responsavel',
            'responsavel_nome',
            'total_exercicios',
            'exercicios_concluidos',
            'ultima_sessao',
        ]
        read_only_fields = [
            'id',
            'responsavel_nome',
            'total_exercicios',
            'exercicios_concluidos',
        ]

    def get_total_exercicios(self, obj):
        return obj.exercicios.count()

    def get_exercicios_concluidos(self, obj):
        return obj.exercicios.filter(resultados__isnull=False).distinct().count()

    def get_ultima_sessao(self, obj):
        exercicio = obj.exercicios.order_by('-created_at').first()

        if not exercicio:
            return None

        return exercicio.created_at

    def validate_nome(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nome é obrigatório")
        return value

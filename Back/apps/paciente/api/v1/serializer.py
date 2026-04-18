from rest_framework import serializers
from apps.paciente.models import Paciente


class PacienteSerializer(serializers.ModelSerializer):
    total_exercicios = serializers.IntegerField(read_only=True)
    exercicios_concluidos = serializers.IntegerField(read_only=True)
    ultima_sessao = serializers.DateTimeField(read_only=True)
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

    def validate_nome(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nome é obrigatório")
        return value

from rest_framework import serializers
from apps.paciente.models import Paciente


class PacienteSerializer(serializers.ModelSerializer):
    responsavel_nome = serializers.CharField(source='responsavel.nome', read_only=True)

    class Meta:
        model = Paciente
        fields = [
            'id',
            'nome',
            'data_nascimento',
            'observacoes',
            'responsavel',
            'responsavel_nome',
        ]
        read_only_fields = ['id', 'responsavel_nome']

    def validate_nome(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nome é obrigatório")
        return value

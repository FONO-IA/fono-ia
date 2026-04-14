from rest_framework import serializers
from apps.paciente.models import Paciente


class PacienteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Paciente
        fields = [
            'nome',
            'data_nascimento',
            'observacoes',
        ]
        read_only_fields = ['id']

    def validate_nome(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nome é obrigatório")
        return value

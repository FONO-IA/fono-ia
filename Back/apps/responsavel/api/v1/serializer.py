from rest_framework import serializers
from apps.responsavel.models import Responsavel


class ResponsavelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Responsavel
        fields = [
            'id',
            'nome',
            'cpf',
            'email',
            'telefone',
        ]
        read_only_fields = ['id']

    def validate_cpf(self, value):

        if not value:
            raise serializers.ValidationError("CPF é obrigatório")

        cpf = ''.join(filter(str.isdigit, value))
        if len(cpf) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos")
        return value

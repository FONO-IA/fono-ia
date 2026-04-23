from rest_framework import serializers
from apps.fonoaudiologo.models import Fonoaudiologo


class FonoaudiologoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Fonoaudiologo
        fields = [
            'id',
            'nome',
            'cpf',
            'crfa',
            'telefone',
            'email',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

    def validate_cpf(self, value):

        if not value:
            raise serializers.ValidationError("CPF é obrigatório")

        cpf = ''.join(filter(str.isdigit, value))
        if len(cpf) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos")
        return value

    def validate_crfa(self, value):
        if not value:
            raise serializers.ValidationError("CRFa é obrigatório")
        return value

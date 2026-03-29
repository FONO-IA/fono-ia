from rest_framework import serializers
from apps.core.models import Fonoaudiologo, Responsavel


class FonoaudiologoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Fonoaudiologo
        fields = [
            'id',
            'nome',
            'cpf',
            'crfa',
            'telefone',
            'data_cadastro'
        ]
        read_only_fields = ['id', 'data_cadastro']

    def validate_cpf(self, value):

        if not value:
            raise serializers.ValidationError("CPF é obrigatório")

        # Remove caracteres não numéricos
        cpf = ''.join(filter(str.isdigit, value))
        if len(cpf) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos")
        return value

    def validate_crfa(self, value):
        # Validação básica do CRFa
        if not value:
            raise serializers.ValidationError("CRFa é obrigatório")
        return value


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

        # Remove caracteres não numéricos
        cpf = ''.join(filter(str.isdigit, value))
        if len(cpf) != 11:
            raise serializers.ValidationError("CPF deve ter 11 dígitos")
        return value

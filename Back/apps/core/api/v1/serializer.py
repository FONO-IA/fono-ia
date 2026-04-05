from rest_framework import serializers
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.responsavel.models import Responsavel
from apps.paciente.models import Paciente


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
            'data_cadastro'
        ]
        read_only_fields = ['id', 'data_cadastro']

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


class PacienteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Paciente
        fields = [
            'id',
            'nome',
            'data_nascimento',
            'observacoes',
        ]
        read_only_fields = ['id']

    def validate_nome(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nome é obrigatório")
        return value

from rest_framework import serializers
from apps.atendimento.models import Atendimento


class AtendimentoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Atendimento
        fields = [
            'paciente',
            'fonoaudiologo',
            'exercicio',
            'observacoes',
        ]
        read_only_fields = ['id']

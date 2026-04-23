from rest_framework import serializers
from apps.atendimento.models import Atendimento


class AtendimentoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Atendimento
        fields = [
            'id',
            'paciente',
            'fonoaudiologo',
            'exercicio',
            'observacoes',
            'concluido',
        ]
        read_only_fields = ['id']

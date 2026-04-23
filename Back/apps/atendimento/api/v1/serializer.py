from rest_framework import serializers
from apps.atendimento.models import Atendimento


class AtendimentoSerializer(serializers.ModelSerializer):
    paciente_nome = serializers.CharField(source='paciente.nome', read_only=True)
    fonoaudiologo_nome = serializers.CharField(source='fonoaudiologo.nome', read_only=True)
    exercicio_categoria = serializers.CharField(source='exercicio.categoria', read_only=True)
    exercicio_nivel = serializers.CharField(source='exercicio.nivel', read_only=True)

    class Meta:
        model = Atendimento
        fields = [
            'id',
            'paciente',
            'paciente_nome',
            'fonoaudiologo',
            'fonoaudiologo_nome',
            'exercicio',
            'exercicio_categoria',
            'exercicio_nivel',
            'observacoes',
            'concluido',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'paciente_nome',
            'fonoaudiologo_nome',
            'exercicio_categoria',
            'exercicio_nivel',
            'created_at',
            'updated_at',
        ]
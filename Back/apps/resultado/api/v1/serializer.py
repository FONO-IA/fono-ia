from rest_framework import serializers
from apps.resultado.models import Resultado


class ResultadoSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = Resultado
        fields = '__all__'

    def get_audio_url(self, obj):
        if not obj.audio:
            return None

        request = self.context.get('request')
        url = obj.audio.url

        return request.build_absolute_uri(url) if request else url

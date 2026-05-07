from rest_framework import serializers
from apps.exercicio.models import Exercicio, ConteudoExercicio


class ConteudoExercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConteudoExercicio
        fields = ["id", "texto", "instrucao"]


class ExercicioSerializer(serializers.ModelSerializer):
    conteudos = ConteudoExercicioSerializer(many=True, required=False)
    palavras = serializers.ListField(
        child=serializers.CharField(allow_blank=False, trim_whitespace=True),
        required=False,
        write_only=True,
    )
    nivel_display = serializers.CharField(
        source='get_nivel_display', read_only=True
    )
    titulo = serializers.SerializerMethodField()
    descricao = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    dificuldade = serializers.CharField(source='nivel', read_only=True)
    prazo = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    referencia_url = serializers.SerializerMethodField()

    class Meta:
        model = Exercicio
        fields = "__all__"

    def get_titulo(self, obj):
        return obj.categoria

    def get_descricao(self, obj):
        return obj.objetivo

    def get_status(self, obj):
        return "concluido" if obj.concluido else "pendente"

    def get_prazo(self, obj):
        return None

    def get_audio_url(self, obj):
        return None

    def get_referencia_url(self, obj):
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["palavras"] = [
            conteudo.texto
            for conteudo in instance.conteudos.all()
            if conteudo.texto
        ]
        return data

    def build_conteudos(self, conteudos_data, palavras, instrucao):
        conteudos = []
        seen = set()

        for conteudo in conteudos_data:
            texto = (conteudo.get("texto") or "").strip()
            item_instrucao = (conteudo.get("instrucao") or instrucao or "").strip()

            if not texto:
                continue

            seen.add(texto.lower())
            conteudos.append({
                "texto": texto,
                "instrucao": item_instrucao or f"Pratique: {texto}",
            })

        for palavra in palavras:
            texto = (palavra or "").strip()

            if not texto or texto.lower() in seen:
                continue

            seen.add(texto.lower())
            conteudos.append({
                "texto": texto,
                "instrucao": (instrucao or f"Pratique: {texto}").strip(),
            })

        return conteudos

    def create(self, validated_data):
        conteudos_data = validated_data.pop("conteudos", [])
        palavras = validated_data.pop("palavras", [])
        pacientes = validated_data.pop("paciente", [])

        exercicio = Exercicio.objects.create(**validated_data)

        if pacientes:
            exercicio.paciente.set(pacientes)

        conteudos = self.build_conteudos(
            conteudos_data,
            palavras,
            validated_data.get("instrucao", ""),
        )

        for conteudo in conteudos:
            ConteudoExercicio.objects.create(
                exercicio=exercicio,
                **conteudo
            )

        return exercicio

    def update(self, instance, validated_data):
        conteudos_data = validated_data.pop("conteudos", None)
        palavras = validated_data.pop("palavras", None)
        pacientes = validated_data.pop("paciente", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if pacientes is not None:
            instance.paciente.set(pacientes)

        if conteudos_data is not None or palavras is not None:
            instance.conteudos.all().delete()
            conteudos = self.build_conteudos(
                conteudos_data or [],
                palavras or [],
                instance.instrucao,
            )

            for conteudo in conteudos:
                ConteudoExercicio.objects.create(
                    exercicio=instance,
                    **conteudo
                )

        return instance

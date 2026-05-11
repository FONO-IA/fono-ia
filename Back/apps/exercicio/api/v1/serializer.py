import re

from rest_framework import serializers
from apps.exercicio.models import Exercicio, ConteudoExercicio
from apps.resultado.models import Resultado


class ConteudoExercicioSerializer(serializers.ModelSerializer):
    dica_visual_url = serializers.SerializerMethodField()
    audio_url = serializers.SerializerMethodField()
    resultado_id = serializers.SerializerMethodField()
    feedback = serializers.SerializerMethodField()

    class Meta:
        model = ConteudoExercicio
        fields = [
            "id",
            "texto",
            "instrucao",
            "dica_visual",
            "dica_visual_url",
            "audio_url",
            "resultado_id",
            "feedback",
        ]
        extra_kwargs = {
            "dica_visual": {"required": False, "allow_null": True},
        }

    def get_dica_visual_url(self, obj):
        if not obj.dica_visual:
            return None

        request = self.context.get("request")
        url = obj.dica_visual.url

        return request.build_absolute_uri(url) if request else url

    def get_resultado(self, obj):
        cache_name = "_ultimo_resultado_cache"

        if hasattr(obj, cache_name):
            return getattr(obj, cache_name)

        request = self.context.get("request")
        paciente_id = self.context.get("paciente_id")

        if not paciente_id and request:
            paciente_id = request.query_params.get("paciente")

        resultados = Resultado.objects.actives().filter(exercicio=obj.exercicio)

        if paciente_id:
            resultados = resultados.filter(
                feedback__paciente_id=str(paciente_id)
            )

        resultado = resultados.filter(
            feedback__conteudo_id=str(obj.id)
        ).order_by("-updated_at", "-created_at").first()

        if not resultado:
            resultado = resultados.filter(
                feedback__palavra_alvo=obj.texto
            ).order_by("-updated_at", "-created_at").first()

        setattr(obj, cache_name, resultado)

        return resultado

    def get_audio_url(self, obj):
        resultado = self.get_resultado(obj)

        if not resultado or not resultado.audio:
            return None

        request = self.context.get("request")
        url = resultado.audio.url

        return request.build_absolute_uri(url) if request else url

    def get_resultado_id(self, obj):
        resultado = self.get_resultado(obj)
        return str(resultado.id) if resultado else None

    def get_feedback(self, obj):
        resultado = self.get_resultado(obj)
        return resultado.feedback if resultado else None


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
    ultimo_resultado_id = serializers.SerializerMethodField()
    ultimo_feedback = serializers.SerializerMethodField()
    referencia_url = serializers.SerializerMethodField()

    class Meta:
        model = Exercicio
        fields = "__all__"

    def get_titulo(self, obj):
        return obj.nome or obj.categoria

    def get_descricao(self, obj):
        return obj.objetivo

    def get_status(self, obj):
        return "concluido" if obj.concluido else "pendente"

    def get_prazo(self, obj):
        return None

    def get_audio_url(self, obj):
        resultado = self.get_ultimo_resultado(obj)

        if not resultado or not resultado.audio:
            return None

        request = self.context.get("request")
        url = resultado.audio.url

        return request.build_absolute_uri(url) if request else url

    def get_ultimo_resultado_id(self, obj):
        resultado = self.get_ultimo_resultado(obj)
        return str(resultado.id) if resultado else None

    def get_ultimo_feedback(self, obj):
        resultado = self.get_ultimo_resultado(obj)
        return resultado.feedback if resultado else None

    def get_referencia_url(self, obj):
        return None

    def get_ultimo_resultado(self, obj):
        cache_name = "_ultimo_resultado_cache"

        if hasattr(obj, cache_name):
            return getattr(obj, cache_name)

        request = self.context.get("request")
        paciente_id = self.context.get("paciente_id")

        if not paciente_id and request:
            paciente_id = request.query_params.get("paciente")

        resultados = Resultado.objects.actives().filter(exercicio=obj)

        if paciente_id:
            resultados = resultados.filter(
                feedback__paciente_id=str(paciente_id)
            )

        resultado = resultados.order_by("-updated_at", "-created_at").first()
        setattr(obj, cache_name, resultado)

        return resultado

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["palavras"] = [
            conteudo.texto
            for conteudo in instance.conteudos.all()
            if conteudo.texto
        ]
        return data

    def split_conteudo_words(self, conteudo):
        return [
            part.strip()
            for part in re.split(r"[,;\n\r]+", conteudo or "")
            if part.strip()
        ]

    def build_conteudos(
        self,
        conteudos_data,
        palavras,
        instrucao,
        conteudo_texto="",
        dica_visual_files=None,
    ):
        conteudos = []
        seen = set()
        dica_visual_files = dica_visual_files or {}

        for index, conteudo in enumerate(conteudos_data):
            texto = (conteudo.get("texto") or "").strip()
            item_instrucao = (conteudo.get("instrucao") or instrucao or "").strip()
            dica_visual = (
                conteudo.get("dica_visual")
                or dica_visual_files.get(index)
            )

            if not texto:
                continue

            seen.add(texto.lower())
            conteudos.append({
                "texto": texto,
                "instrucao": item_instrucao or f"Pratique: {texto}",
                "dica_visual": dica_visual,
            })

        for palavra in palavras:
            texto = (palavra or "").strip()

            if not texto or texto.lower() in seen:
                continue

            seen.add(texto.lower())
            conteudos.append({
                "texto": texto,
                "instrucao": (instrucao or f"Pratique: {texto}").strip(),
                "dica_visual": None,
            })

        for palavra in self.split_conteudo_words(conteudo_texto):
            texto = (palavra or "").strip()

            if not texto or texto.lower() in seen:
                continue

            seen.add(texto.lower())
            conteudos.append({
                "texto": texto,
                "instrucao": (instrucao or f"Pratique: {texto}").strip(),
                "dica_visual": None,
            })

        return conteudos

    def create(self, validated_data):
        conteudos_data = validated_data.pop("conteudos", [])
        palavras = validated_data.pop("palavras", [])
        pacientes = validated_data.pop("paciente", [])
        nome = (validated_data.get("nome") or "").strip()

        if not nome:
            validated_data["nome"] = (
                f"Exercicio de pronuncia - {validated_data.get('categoria', '')}"
            ).strip()
        else:
            validated_data["nome"] = nome

        exercicio = Exercicio.objects.create(**validated_data)

        if pacientes:
            exercicio.paciente.set(pacientes)

        conteudos = self.build_conteudos(
            conteudos_data,
            palavras,
            validated_data.get("instrucao", ""),
            validated_data.get("conteudo", ""),
            self.context.get("dica_visual_files"),
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
        should_rebuild_conteudos = (
            conteudos_data is not None
            or palavras is not None
            or "conteudo" in validated_data
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if pacientes is not None:
            instance.paciente.set(pacientes)

        if should_rebuild_conteudos:
            instance.conteudos.all().delete()
            conteudos = self.build_conteudos(
                conteudos_data or [],
                palavras or [],
                instance.instrucao,
                instance.conteudo,
                self.context.get("dica_visual_files"),
            )

            for conteudo in conteudos:
                ConteudoExercicio.objects.create(
                    exercicio=instance,
                    **conteudo
                )

        return instance

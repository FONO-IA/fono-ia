from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.exercicio.api.v1.serializer import ExercicioSerializer
from apps.exercicio.models import Exercicio
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.responsavel.models import Responsavel
from apps.resultado.models import Resultado


class ExercicioViewSet(viewsets.ModelViewSet):
    serializer_class = ExercicioSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_fonoaudiologo(self):
        return Fonoaudiologo.objects.filter(user=self.request.user).first()

    def get_responsavel(self):
        return Responsavel.objects.filter(user=self.request.user).first()

    def is_staff_user(self):
        return self.request.user.is_staff or self.request.user.is_superuser

    def user_can_access_exercise(self, exercicio):
        if self.is_staff_user():
            return True

        fono = self.get_fonoaudiologo()

        if fono and exercicio.paciente.filter(fonoaudiologo=fono).exists():
            return True

        responsavel = self.get_responsavel()

        if responsavel and exercicio.paciente.filter(
            responsavel=responsavel
        ).exists():
            return True

        return False

    def require_fonoaudiologo(self):
        fono = self.get_fonoaudiologo()

        if not fono and not self.is_staff_user():
            raise PermissionDenied(
                "Apenas fonoaudiologos podem alterar exercicios."
            )

        return fono

    def validate_pacientes_for_fono(self, pacientes, fono):
        if not fono or self.is_staff_user():
            return

        invalid_pacientes = [
            paciente for paciente in pacientes
            if paciente.fonoaudiologo_id != fono.id
        ]

        if invalid_pacientes:
            raise PermissionDenied(
                "Voce nao tem permissao para criar exercicios para este paciente."
            )

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)
        exercicio = Exercicio.objects.actives().filter(
            **{self.lookup_field: lookup_value}
        ).first()

        if not exercicio:
            raise NotFound("Exercicio nao encontrado.")

        if not self.user_can_access_exercise(exercicio):
            raise PermissionDenied(
                "Voce nao tem permissao para acessar este exercicio."
            )

        self.check_object_permissions(self.request, exercicio)
        return exercicio

    def get_queryset(self):
        queryset = Exercicio.objects.actives()

        if not self.is_staff_user():
            fono = self.get_fonoaudiologo()

            if fono:
                queryset = queryset.filter(paciente__fonoaudiologo=fono)
            else:
                responsavel = self.get_responsavel()

                if responsavel:
                    queryset = queryset.filter(
                        paciente__responsavel=responsavel
                    )
                else:
                    return queryset.none()

        nivel = self.request.query_params.get("nivel")
        categoria = self.request.query_params.get("categoria")
        paciente = self.request.query_params.get("paciente")

        if nivel:
            queryset = queryset.filter(nivel__icontains=nivel)

        if categoria:
            queryset = queryset.filter(categoria__icontains=categoria)

        if paciente:
            queryset = queryset.filter(paciente__id=paciente)

        return queryset.distinct()

    def create(self, request, *args, **kwargs):
        fono = self.require_fonoaudiologo()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.validate_pacientes_for_fono(
            serializer.validated_data.get("paciente", []),
            fono,
        )
        self.perform_create(serializer)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=self.get_success_headers(serializer.data),
        )

    def update(self, request, *args, **kwargs):
        fono = self.require_fonoaudiologo()
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        self.validate_pacientes_for_fono(
            serializer.validated_data.get("paciente", []),
            fono,
        )
        self.perform_update(serializer)

        return Response(serializer.data)

    def perform_destroy(self, instance):
        self.require_fonoaudiologo()
        instance.soft_delete(self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response(
            {"message": "Exercicio excluido com sucesso"},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["post"])
    def responder(self, request, pk=None):
        exercicio = self.get_object()
        responsavel = self.get_responsavel()
        audio = request.FILES.get("audio")
        paciente_id = request.data.get("paciente_id")

        if not responsavel and not self.is_staff_user():
            raise PermissionDenied(
                "Apenas o responsavel pode enviar respostas do exercicio."
            )

        if not audio:
            return Response(
                {"detail": "Envie um arquivo de audio para concluir."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if paciente_id and not exercicio.paciente.filter(id=paciente_id).exists():
            raise PermissionDenied(
                "Este exercicio nao pertence ao paciente informado."
            )

        feedback = {
            "tipo": "audio",
            "status": "concluido",
            "paciente_id": str(paciente_id) if paciente_id else None,
            "audio_recebido": True,
            "audio_nome": audio.name,
            "audio_tamanho": audio.size,
            "audio_content_type": getattr(audio, "content_type", None),
            # TODO: Persistir o arquivo de audio quando o model tiver FileField.
        }

        resultado = Resultado.objects.create(
            exercicio=exercicio,
            feedback=feedback,
        )

        if not exercicio.concluido:
            exercicio.concluido = True
            exercicio.save(update_fields=["concluido", "updated_at"])

        return Response(
            {
                "id": resultado.id,
                "detail": "Resposta registrada com sucesso.",
                "concluido": True,
                "feedback": resultado.feedback,
            },
            status=status.HTTP_201_CREATED,
        )

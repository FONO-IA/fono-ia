from rest_framework import viewsets, status, permissions
from rest_framework.response import Response

from apps.fonoaudiologo.models import Fonoaudiologo
from apps.responsavel.models import Responsavel
from apps.resultado.api.v1.serializer import ResultadoSerializer
from apps.resultado.models import Resultado


class ResultadoViewSet(viewsets.ModelViewSet):
    serializer_class = ResultadoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_fonoaudiologo(self):
        return Fonoaudiologo.objects.filter(user=self.request.user).first()

    def get_responsavel(self):
        return Responsavel.objects.filter(user=self.request.user).first()

    def get_queryset(self):
        queryset = Resultado.objects.actives()

        if not (self.request.user.is_staff or self.request.user.is_superuser):
            fono = self.get_fonoaudiologo()

            if fono:
                queryset = queryset.filter(
                    exercicio__paciente__fonoaudiologo=fono
                )
            else:
                responsavel = self.get_responsavel()

                if responsavel:
                    queryset = queryset.filter(
                        exercicio__paciente__responsavel=responsavel
                    )
                else:
                    return queryset.none()

        paciente = self.request.query_params.get("paciente")

        if paciente:
            queryset = queryset.filter(
                exercicio__paciente__id=paciente
            )

        return queryset.distinct()

    def perform_destroy(self, instance):
        instance.soft_delete(self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response(
            {"message": "Resultado excluido com sucesso"},
            status=status.HTTP_204_NO_CONTENT,
        )

from rest_framework import viewsets, status, permissions
from rest_framework.response import Response

from apps.resultado.models import Resultado
from apps.resultado.api.v1.serializer import ResultadoSerializer


class ResultadoViewSet(viewsets.ModelViewSet):
    serializer_class = ResultadoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Resultado.objects.actives()

        paciente = self.request.query_params.get("paciente")

        if paciente:
            queryset = queryset.filter(
                exercicio__paciente__id=paciente
            ).distinct()

        return queryset

    def perform_destroy(self, instance):
        instance.soft_delete(self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response(
            {"message": "Resultado excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT,
        )
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from apps.resultado.models import Resultado
from apps.resultado.api.v1.serializer import ResultadoSerializer
from apps.core.permissions import IsFonoaudiologo, IsPaciente


class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.actives()
    serializer_class = ResultadoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated(), IsPaciente()]
        else:
            return [permissions.IsAuthenticated(), IsFonoaudiologo()]

    def perform_destroy(self, instance):
        instance.soft_delete(self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Resultado excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT
        )

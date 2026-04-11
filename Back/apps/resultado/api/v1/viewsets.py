from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from apps.resultado.models import Resultado
from apps.resultado.serializers import ResultadoSerializer


class ResultadoViewSet(viewsets.ModelViewSet):
    queryset = Resultado.objects.all()
    serializer_class = ResultadoSerializer

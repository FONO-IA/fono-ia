from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from apps.exercicio.models import Exercicio
from apps.exercicio.api.v1.serializer import ExercicioSerializer


class ExercicioViewSet(viewsets.ModelViewSet):
    serializer_class = ExercicioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Exercicio.objects.actives()

        nivel = self.request.query_params.get("nivel")
        categoria = self.request.query_params.get("categoria")
        paciente = self.request.query_params.get("paciente")

        if nivel:
            queryset = queryset.filter(nivel__icontains=nivel)

        if categoria:
            queryset = queryset.filter(categoria__icontains=categoria)

        if paciente:
            queryset = queryset.filter(paciente__id=paciente).distinct()

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=self.get_success_headers(serializer.data),
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def perform_destroy(self, instance):
        instance.soft_delete(self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response(
            {"message": "Exercício excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT,
        )
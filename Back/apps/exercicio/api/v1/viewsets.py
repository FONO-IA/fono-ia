from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from apps.exercicio.models import Exercicio
from apps.exercicio.api.v1.serializer import ExercicioSerializer


class ExercicioViewSet(viewsets.ModelViewSet):

    queryset = Exercicio.objects.all()
    serializer_class = ExercicioSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):

        queryset = Exercicio.objects.all()
        nivel = self.request.query_params.get('nivel', None)
        categoria = self.request.query_params.get('categoria', None)

        if nivel:
            queryset = queryset.filter(nivel__icontains=nivel)
        if categoria:
            queryset = queryset.filter(categoria__icontains=categoria)

        return queryset

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):

        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Exercício excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT
        )

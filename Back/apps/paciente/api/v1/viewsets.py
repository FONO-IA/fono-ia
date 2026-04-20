from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from apps.paciente.models import Paciente
from apps.paciente.api.v1.serializer import PacienteSerializer
from django.db.models import Count, Q, OuterRef, Subquery
from apps.atendimento.models import Atendimento


class PacienteViewSet(viewsets.ModelViewSet):

    serializer_class = PacienteSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Paciente.objects.actives()
        nome = self.request.query_params.get('nome', None)
        data_nascimento = self.request.query_params.get(
            'data_nascimento', None
        )

        if nome:
            queryset = queryset.filter(nome__icontains=nome)
        if data_nascimento:
            queryset = queryset.filter(data_nascimento=data_nascimento)

        ultimo_atendimento = Atendimento.objects.filter(
            paciente=OuterRef('pk')
        ).order_by('-updated_at')

        queryset = queryset.annotate(
            total_exercicios=Count('atendimentos'),
            exercicios_concluidos=Count(
                'atendimentos',
                filter=Q(atendimentos__concluido=True)
            ),
            ultima_sessao=Subquery(ultimo_atendimento.values('updated_at')[:1])
        )
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

    def perform_destroy(self, instance):
        instance.soft_delete(self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Paciente excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT
        )

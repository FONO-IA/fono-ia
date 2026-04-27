from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from apps.paciente.models import Paciente
from apps.paciente.api.v1.serializer import PacienteSerializer
from apps.core.permissions import IsFonoaudiologo
from apps.fonoaudiologo.models import Fonoaudiologo
from rest_framework import serializers


class PacienteViewSet(viewsets.ModelViewSet):

    serializer_class = PacienteSerializer
    permission_classes = [permissions.IsAuthenticated, IsFonoaudiologo]

    def get_queryset(self):
        user = self.request.user

        try:
            fono = Fonoaudiologo.objects.get(user=user)
            return Paciente.objects.filter(fonoaudiologo=fono)
        except Fonoaudiologo.DoesNotExist:
            return Paciente.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        try:
            fono = Fonoaudiologo.objects.get(user=user)
        except Fonoaudiologo.DoesNotExist:
            raise serializers.ValidationError("Fonoaudiólogo não encontrado")

        serializer.save(fonoaudiologo=fono)

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

from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response

from apps.paciente.models import Paciente
from apps.paciente.api.v1.serializer import PacienteSerializer
from apps.fonoaudiologo.models import Fonoaudiologo


class PacienteViewSet(viewsets.ModelViewSet):
    serializer_class = PacienteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_fonoaudiologo(self):
        try:
            return Fonoaudiologo.objects.get(user=self.request.user)
        except Fonoaudiologo.DoesNotExist:
            raise serializers.ValidationError(
                "Fonoaudiólogo não encontrado para este usuário."
            )

    def get_queryset(self):
        try:
            fono = self.get_fonoaudiologo()
        except serializers.ValidationError:
            return Paciente.objects.none()

        return Paciente.objects.filter(fonoaudiologo=fono)

    def perform_create(self, serializer):
        fono = self.get_fonoaudiologo()
        serializer.save(fonoaudiologo=fono)

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
            {"message": "Paciente excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT,
        )
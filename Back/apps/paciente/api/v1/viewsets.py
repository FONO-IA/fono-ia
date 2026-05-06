from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response

from apps.exercicio.api.v1.serializer import ExercicioSerializer
from apps.exercicio.models import Exercicio
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.paciente.api.v1.serializer import PacienteSerializer
from apps.paciente.models import Paciente
from apps.responsavel.models import Responsavel


class PacienteViewSet(viewsets.ModelViewSet):
    serializer_class = PacienteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_fonoaudiologo(self):
        return Fonoaudiologo.objects.filter(user=self.request.user).first()

    def get_responsavel(self):
        return Responsavel.objects.filter(user=self.request.user).first()

    def require_fonoaudiologo(self):
        fono = self.get_fonoaudiologo()

        if not fono:
            raise PermissionDenied(
                "Apenas fonoaudiologos podem alterar pacientes."
            )

        return fono

    def user_can_access_patient(self, paciente):
        fono = self.get_fonoaudiologo()

        if fono and paciente.fonoaudiologo_id == fono.id:
            return True

        responsavel = self.get_responsavel()

        if responsavel and paciente.responsavel_id == responsavel.id:
            return True

        return False

    def get_queryset(self):
        queryset = Paciente.objects.actives()
        fono = self.get_fonoaudiologo()

        if fono:
            return queryset.filter(fonoaudiologo=fono)

        responsavel = self.get_responsavel()

        if responsavel:
            return queryset.filter(responsavel=responsavel)

        return queryset.none()

    def perform_create(self, serializer):
        fono = self.require_fonoaudiologo()
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
        self.require_fonoaudiologo()
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
        self.require_fonoaudiologo()
        instance.soft_delete(self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)

        return Response(
            {"message": "Paciente excluido com sucesso"},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=True, methods=["get"])
    def exercicios(self, request, pk=None):
        try:
            paciente = Paciente.objects.actives().get(pk=pk)
        except Paciente.DoesNotExist:
            raise NotFound("Paciente nao encontrado.")

        if not self.user_can_access_patient(paciente):
            raise PermissionDenied(
                "Voce nao tem permissao para acessar este paciente."
            )

        exercicios = Exercicio.objects.actives().filter(
            paciente=paciente
        ).distinct()
        serializer = ExercicioSerializer(exercicios, many=True)
        return Response(serializer.data)

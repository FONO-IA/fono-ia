from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.responsavel.models import Responsavel
from apps.paciente.models import Paciente
from apps.core.api.v1.serializer import (
    FonoaudiologoSerializer,
    ResponsavelSerializer,
    PacienteSerializer,
)


class FonoaudiologoViewSet(viewsets.ModelViewSet):

    queryset = Fonoaudiologo.objects.all()
    serializer_class = FonoaudiologoSerializer

    permission_classes = [permissions.AllowAny]

    def get_queryset(self):

        queryset = Fonoaudiologo.objects.all()
        nome = self.request.query_params.get('nome', None)
        cpf = self.request.query_params.get('cpf', None)

        if nome:
            queryset = queryset.filter(nome__icontains=nome)
        if cpf:
            queryset = queryset.filter(cpf__icontains=cpf)

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
            {"message": "Fonoaudiólogo excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT
        )


class ResponsavelViewSet(viewsets.ModelViewSet):

    queryset = Responsavel.objects.all()
    serializer_class = ResponsavelSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Responsavel.objects.all()
        nome = self.request.query_params.get('nome', None)
        cpf = self.request.query_params.get('cpf', None)

        if nome:
            queryset = queryset.filter(nome__icontains=nome)
        if cpf:
            queryset = queryset.filter(cpf__icontains=cpf)

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
            {"message": "Responsável excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT
        )


class PacienteViewSet(viewsets.ModelViewSet):

    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Paciente.objects.all()
        nome = self.request.query_params.get('nome', None)
        data_nascimento = self.request.query_params.get(
            'data_nascimento', None
        )

        if nome:
            queryset = queryset.filter(nome__icontains=nome)
        if data_nascimento:
            queryset = queryset.filter(data_nascimento=data_nascimento)

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
            {"message": "Paciente excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT
        )

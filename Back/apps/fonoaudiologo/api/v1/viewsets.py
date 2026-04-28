from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.fonoaudiologo.api.v1.serializer import FonoaudiologoSerializer
from apps.core.permissions import IsFonoaudiologo
from rest_framework.decorators import action
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import Group


class FonoaudiologoViewSet(viewsets.ModelViewSet):

    serializer_class = FonoaudiologoSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]

        if self.action in ['list', 'retrieve', 'me', 'alterar_senha']:
            return [permissions.IsAuthenticated()]

        return [permissions.IsAuthenticated(), IsFonoaudiologo()]

    def get_queryset(self):

        queryset = Fonoaudiologo.objects.actives()
        nome = self.request.query_params.get('nome', None)
        cpf = self.request.query_params.get('cpf', None)

        if nome:
            queryset = queryset.filter(nome__icontains=nome)
        if cpf:
            queryset = queryset.filter(cpf__icontains=cpf)

        return queryset

    def perform_create(self, serializer):
        # Extrai username e password do request.data
        username = self.request.data.get('username')
        password = self.request.data.get('password')
        email = self.request.data.get('email')

        if not username or not password:
            raise serializers.ValidationError({
                "username": "Este campo é obrigatório",
                "password": "Este campo é obrigatório"
            })

        # Cria o usuário
        User = get_user_model()
        user = User.objects.create_user(
            username=email,
            password=password,
            email=email
        )

        # Adicionando o fono criado ao grupo de fonoaudiólogos
        fono_group = Group.objects.get(name='Fonoaudiólogos')
        user.groups.add(fono_group)

        fonoaudiologo = serializer.save(user=user)

        send_mail(
            subject="Bem-vindo(a) ao Fono IA - Dados de acesso",
            message=f"""
        Olá, {fonoaudiologo.nome}!

        Seja bem-vindo(a) ao Fono IA.

        Seu cadastro foi realizado com sucesso.
        Abaixo estão seus dados de acesso:

        Usuário: {username}
        Senha: {password}

        Acesse o sistema e faça login com essas informações.

        Por segurança, recomendamos alterar sua senha após o primeiro acesso.

        Atenciosamente,
        Equipe Fono IA
        """,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[fonoaudiologo.email],
            fail_silently=True,
        )

        # Salva o fonoaudiólogo com o usuário associado
        serializer.save(user=user)

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
            {"message": "Fonoaudiólogo excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            fono = Fonoaudiologo.objects.get(user=request.user)
        except Fonoaudiologo.DoesNotExist:
            return Response(
                {"detail": "Fonoaudiólogo não encontrado"},
                status=404
            )

        serializer = self.get_serializer(fono)
        return Response(serializer.data)

    @action(
            detail=False, methods=["post"],
            permission_classes=[permissions.IsAuthenticated]
    )
    def alterar_senha(self, request):
        senha_atual = request.data.get("senha_atual")
        nova_senha = request.data.get("nova_senha")

        if not senha_atual or not nova_senha:
            return Response(
                {"detail": "Informe a senha atual e a nova senha."},
                status=400,
            )

        user = request.user

        if not user.check_password(senha_atual):
            return Response(
                {"detail": "Senha atual incorreta."},
                status=400,
            )

        user.set_password(nova_senha)
        user.save()

        return Response({"detail": "Senha alterada com sucesso."})

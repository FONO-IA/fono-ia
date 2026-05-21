from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.mail import send_mail
from django.conf import settings
from apps.core.notifications import imprimir_credenciais_acesso
from apps.responsavel.models import Responsavel
from apps.responsavel.api.v1.serializer import ResponsavelSerializer
from apps.paciente.models import Paciente
from apps.paciente.api.v1.serializer import PacienteSerializer


class ResponsavelViewSet(viewsets.ModelViewSet):
    serializer_class = ResponsavelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_responsavel_logado(self):
        try:
            return Responsavel.objects.actives().get(user=self.request.user)
        except Responsavel.DoesNotExist:
            raise NotFound("Responsável não encontrado para este usuário.")

    def get_queryset(self):
        queryset = Responsavel.objects.actives()

        nome = self.request.query_params.get("nome")
        cpf = self.request.query_params.get("cpf")

        if nome:
            queryset = queryset.filter(nome__icontains=nome)

        if cpf:
            queryset = queryset.filter(cpf__icontains=cpf)

        return queryset
    
    def perform_create(self, serializer):
        # Extrai os dados do request
        username = self.request.data.get('username')
        password = self.request.data.get('password')
        email = self.request.data.get('email')
        nome = self.request.data.get('nome')
        
        # Validações
        if not username or not password:
            raise serializers.ValidationError({
                "username": "Este campo é obrigatório",
                "password": "Este campo é obrigatório"
            })
        
        if not email:
            raise serializers.ValidationError({
                "email": "Este campo é obrigatório"
            })
        
        # Cria o usuário - Responsável NÃO deve ter acesso ao admin
        User = get_user_model()
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=nome.split()[0] if nome else '',  # Primeiro nome
            last_name=' '.join(nome.split()[1:]) if nome and len(nome.split()) > 1 else '',  # Sobrenome
            is_staff=False,
            is_superuser=False,
            is_active=True
        )
        
        # Busca ou cria o grupo de responsáveis
        responsavel_group, created = Group.objects.get_or_create(name='Responsavel')
        user.groups.add(responsavel_group)
        
        # Salva o responsável com o usuário associado
        responsavel = serializer.save(user=user)
        email_enviado = False
        
        # Envia o email de boas-vindas
        try:
            send_mail(
                subject="Bem-vindo(a) ao Fono IA - Dados de acesso (Responsável)",
                message=f"""
    Olá, {responsavel.nome}!

    Seu cadastro como responsável foi realizado com sucesso no Fono IA.

    Abaixo estão seus dados de acesso:

    Usuário: {username}
    Senha: {password}

    Com estas credenciais você poderá:
    - Acompanhar os dados dos pacientes sob sua responsabilidade
    - Visualizar relatórios e evoluções
    - Gerenciar seu perfil

    Acesse o sistema e faça login com estas informações.

    Por segurança, recomendamos alterar sua senha após o primeiro acesso.

    Atenciosamente,
    Equipe Fono IA
    """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[responsavel.email],
                fail_silently=False,  # Mude para False para depurar erros de email
            )
            email_enviado = True
        except Exception as e:
            # Log do erro mas não impede o cadastro
            print(f"Erro ao enviar email para responsável: {e}")

        imprimir_credenciais_acesso(
            nome=responsavel.nome,
            email=responsavel.email,
            usuario=user.username,
            senha=password,
            perfil="Responsavel",
            email_status="sim" if email_enviado else "nao",
        )

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
            {"message": "Responsável excluído com sucesso"},
            status=status.HTTP_204_NO_CONTENT,
        )

    @action(detail=False, methods=["get"])
    def me(self, request):
        responsavel = self.get_responsavel_logado()
        serializer = self.get_serializer(responsavel)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="me/pacientes")
    def me_pacientes(self, request):
        responsavel = self.get_responsavel_logado()
        pacientes = Paciente.objects.actives().filter(responsavel=responsavel)
        serializer = PacienteSerializer(pacientes, many=True)
        return Response(serializer.data)

# apps/pacientes/management/commands/setup_responsavel_group.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from apps.pacientes.models import Paciente, Responsavel


class Command(BaseCommand):
    help = 'Configura grupo e permissões para Responsáveis (acesso limitado)'

    def handle(self, *args, **options):
        """Método principal que executa a configuração do grupo."""
        grupo_responsavel, created = Group.objects.get_or_create(name='Responsavel')

        if created:
            self.stdout.write(
                self.style.SUCCESS('Grupo Responsável criado com sucesso!')
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Grupo Responsável já existe, atualizando permissões...'
                )
            )

        # Limpar permissões existentes
        grupo_responsavel.permissions.clear()

        # Obter ContentTypes dos modelos
        responsavel_ct = ContentType.objects.get_for_model(Responsavel)
        paciente_ct = ContentType.objects.get_for_model(Paciente)
        user_ct = ContentType.objects.get_for_model(User)

        # Lista de permissões APENAS para visualização (sem edição/criação/exclusão)
        permissoes_responsavel = [
            # Permissões para o próprio perfil de responsável
            Permission.objects.get(
                codename='view_responsavel',
                content_type=responsavel_ct
            ),
            Permission.objects.get(
                codename='change_responsavel',
                content_type=responsavel_ct
            ),
            
            # Permissões APENAS de visualização para pacientes (não pode editar)
            Permission.objects.get(
                codename='view_paciente',
                content_type=paciente_ct
            ),
            
            # Permissões MINIMAMENTE necessárias para o usuário
            Permission.objects.get(
                codename='view_user',
                content_type=user_ct
            ),
        ]

        # NÃO incluir permissões de admin/staff
        # Evitar permissões como: add_paciente, delete_paciente, change_paciente
        # Evitar permissões de admin: can_add_log_entry, can_view_log_entry, etc.

        # Aplicar permissões ao grupo
        grupo_responsavel.permissions.add(*permissoes_responsavel)

        # Garantir que usuários deste grupo NÃO sejam staff ou superuser
        # Isso deve ser feito no momento da criação do usuário
        
        # Relatório final
        self.stdout.write(
            self.style.SUCCESS(
                f'\n Grupo RESPONSÁVEL configurado com '
                f'{len(permissoes_responsavel)} permissões:'
            )
        )
        for perm in permissoes_responsavel:
            self.stdout.write(f'   - {perm.name}')
        
        self.stdout.write(
            self.style.WARNING(
                '\n⚠️  IMPORTANTE: Ao criar usuários Responsáveis, certifique-se de definir:'
            )
        )
        self.stdout.write('   - is_staff = False')
        self.stdout.write('   - is_superuser = False')
        self.stdout.write('   - is_active = True')

# apps/pacientes/management/commands/setup_fonoaudiologo_group.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from apps.pacientes.models import Paciente, Fonoaudiologo, Responsavel


class Command(BaseCommand):
    help = 'Configura grupo e permissões para Fonoaudiólogos'

    def handle(self, *args, **options):
        """Método principal que executa a configuração do grupo."""
        grupo_fono, created = Group.objects.get_or_create(name='Fonoaudiologo')

        if created:
            self.stdout.write(
                self.style.SUCCESS('Grupo Fonoaudiólogo criado com sucesso!')
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Grupo Fonoaudiólogo já existe, atualizando permissões...'
                )
            )

        # Limpar permissões existentes
        grupo_fono.permissions.clear()

        # Obter ContentTypes dos modelos
        fono_ct = ContentType.objects.get_for_model(Fonoaudiologo)
        paciente_ct = ContentType.objects.get_for_model(Paciente)
        responsavel_ct = ContentType.objects.get_for_model(Responsavel)
        user_ct = ContentType.objects.get_for_model(User)

        # Lista de permissões para Fonoaudiólogo
        permissoes_fono = [
            # Permissões CRUD para Fonoaudiólogo
            Permission.objects.get(
                codename='view_fonoaudiologo',
                content_type=fono_ct
            ),
            Permission.objects.get(
                codename='add_fonoaudiologo',
                content_type=fono_ct
            ),
            Permission.objects.get(
                codename='change_fonoaudiologo',
                content_type=fono_ct
            ),
            Permission.objects.get(
                codename='delete_fonoaudiologo',
                content_type=fono_ct
            ),
            # Permissões CRUD para Paciente
            Permission.objects.get(
                codename='view_paciente',
                content_type=paciente_ct
            ),
            Permission.objects.get(
                codename='add_paciente',
                content_type=paciente_ct
            ),
            Permission.objects.get(
                codename='change_paciente',
                content_type=paciente_ct
            ),
            Permission.objects.get(
                codename='delete_paciente',
                content_type=paciente_ct
            ),
            # Permissões CRUD para Responsável
            Permission.objects.get(
                codename='view_responsavel',
                content_type=responsavel_ct
            ),
            Permission.objects.get(
                codename='add_responsavel',
                content_type=responsavel_ct
            ),
            Permission.objects.get(
                codename='change_responsavel',
                content_type=responsavel_ct
            ),
            Permission.objects.get(
                codename='delete_responsavel',
                content_type=responsavel_ct
            ),
            # Permissões para User
            Permission.objects.get(
                codename='view_user',
                content_type=user_ct
            ),
            Permission.objects.get(
                codename='change_user',
                content_type=user_ct
            ),
        ]

        # Aplicar permissões ao grupo
        grupo_fono.permissions.add(*permissoes_fono)

        # Relatório final
        self.stdout.write(
            self.style.SUCCESS(
                f'\n Grupo FONOAUDIÓLOGO configurado com '
                f'{len(permissoes_fono)} permissões:'
            )
        )
        for perm in permissoes_fono:
            self.stdout.write(f'   - {perm.name}')

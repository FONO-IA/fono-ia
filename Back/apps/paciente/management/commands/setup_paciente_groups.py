# apps/pacientes/management/commands/setup_paciente_group.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from apps.pacientes.models import Paciente, Responsavel


class Command(BaseCommand):
    help = 'Configura grupo e permissões para Pacientes'

    def handle(self, *args, **options):
        """Método principal que executa a configuração do grupo."""
        grupo_paciente, created = Group.objects.get_or_create(name='Paciente')

        if created:
            self.stdout.write(
                self.style.SUCCESS('Grupo Paciente criado com sucesso!')
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    'Grupo Paciente já existe, atualizando permissões...'
                )
            )

        # Limpar permissões existentes
        grupo_paciente.permissions.clear()

        # Obter ContentTypes dos modelos
        paciente_ct = ContentType.objects.get_for_model(Paciente)
        responsavel_ct = ContentType.objects.get_for_model(Responsavel)
        user_ct = ContentType.objects.get_for_model(User)

        # Lista de permissões para Paciente
        permissoes_paciente = [
            Permission.objects.get(
                codename='view_paciente',
                content_type=paciente_ct
            ),
            Permission.objects.get(
                codename='view_responsavel',
                content_type=responsavel_ct
            ),
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
        grupo_paciente.permissions.add(*permissoes_paciente)

        # Relatório final
        self.stdout.write(
            self.style.SUCCESS(
                f'\n Grupo PACIENTE configurado com '
                f'{len(permissoes_paciente)} permissões:'
            )
        )
        for perm in permissoes_paciente:
            self.stdout.write(f'   - {perm.name}')

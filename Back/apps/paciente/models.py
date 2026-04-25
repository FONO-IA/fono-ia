from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.responsavel.models import Responsavel
from apps.fonoaudiologo.models import Fonoaudiologo


class Paciente(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # ou User diretamente
        on_delete=models.CASCADE,
        related_name='paciente_profile',
        null=True,
        blank=True,
        verbose_name="Usuário associado"
    )

    nome = models.CharField(max_length=255, verbose_name="Nome completo")
    data_nascimento = models.DateField(verbose_name="Data de nascimento")
    observacoes = models.TextField(
        blank=True, null=True, verbose_name="Observações"
    )
    responsavel = models.ForeignKey(
        Responsavel,
        on_delete=models.PROTECT,
        verbose_name="Responsável"
    )
    fonoaudiologo = models.ManyToManyField(
        Fonoaudiologo,
        blank=True,
        verbose_name="Fonoaudiólogos",
        related_name="pacientes"
    )

    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ['-updated_at']

    def __str__(self):
        return self.nome

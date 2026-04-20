from django.db import models
from apps.core.models import BaseModel
from apps.paciente.models import Paciente
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.exercicio.models import Exercicio


# Create your models here.
class Atendimento(BaseModel):
    paciente = models.ForeignKey(
        Paciente,
        on_delete=models.PROTECT,
        related_name='atendimentos',
        verbose_name="Paciente"
    )
    fonoaudiologo = models.ForeignKey(
        Fonoaudiologo,
        on_delete=models.PROTECT,
        related_name='atendimentos',
        verbose_name="Fonoaudiólogo"
    )
    exercicio = models.ForeignKey(
        Exercicio,
        on_delete=models.PROTECT,
        related_name='atendimentos',
        verbose_name="Exercício"
    )
    observacoes = models.TextField(
        blank=True, null=True, verbose_name="Observações"
    )
    concluido = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Atendimento"
        verbose_name_plural = "Atendimentos"
        ordering = ['-updated_at']

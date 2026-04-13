from django.db import models
from apps.core.models import BaseModel
from apps.responsavel.models import Responsavel


class Paciente(BaseModel):

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

    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ['-updated_at']

    def __str__(self):
        return self.nome

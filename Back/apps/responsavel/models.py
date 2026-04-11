from django.db import models
from apps.core.models import BaseModel


class Responsavel(BaseModel):

    nome = models.CharField(
        max_length=255,
        verbose_name="Nome Completo"
    )
    cpf = models.CharField(
        max_length=14,
        unique=True,
        verbose_name="CPF"
    )
    email = models.EmailField(
        max_length=255,
        unique=True,
        verbose_name="Email"
    )
    telefone = models.CharField(
        max_length=20,
        verbose_name="Telefone"
    )

    class Meta:
        verbose_name = "Responsável"
        verbose_name_plural = "Responsáveis"
        ordering = ['-id']

    def __str__(self):
        return self.nome

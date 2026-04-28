from django.db import models
from apps.core.models import BaseModel
from django.conf import settings


class Responsavel(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='responsavel_profile',
        null=True,
        blank=True,
        verbose_name="Usuário associado"
    )

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
        ordering = ['-updated_at']

    def __str__(self):
        return self.nome

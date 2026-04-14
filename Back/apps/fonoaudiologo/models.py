from django.db import models
from apps.core.models import BaseModel


class Fonoaudiologo(BaseModel):
    nome = models.CharField(max_length=255, verbose_name="Nome completo")
    cpf = models.CharField(max_length=14, unique=True, verbose_name="CPF")
    crfa = models.CharField(max_length=20, unique=True, verbose_name="CRFa")
    telefone = models.CharField(max_length=20, verbose_name="Telefone")
    email = models.EmailField(
        max_length=255,
        unique=True,
        verbose_name="Email",
        default='default@email.com'
    )

    class Meta:
        verbose_name = "Fonoaudiólogo"
        verbose_name_plural = "Fonoaudiólogos"
        ordering = ['-created_at']

    def __str__(self):
        return self.nome

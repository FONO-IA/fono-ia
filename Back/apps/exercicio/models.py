from django.db import models
from apps.core.models import BaseModel


class Exercicio(BaseModel):

    NIVEIS = [
        ('facil', 'Fácil'),
        ('medio', 'Médio'),
        ('dificil', 'Difícil'),
    ]

    nivel = models.CharField(
        max_length=10, choices=NIVEIS, verbose_name="Nível"
    )
    categoria = models.CharField(max_length=50, verbose_name="Categoria")
    conteudo = models.TextField(verbose_name="Conteúdo")
    objetivo = models.TextField(verbose_name="Objetivo")
    instrucao = models.TextField(verbose_name="Instrução")

    class Meta:
        verbose_name = "Exercício"
        verbose_name_plural = "Exercícios"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.categoria} - {self.nivel}"

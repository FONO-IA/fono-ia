from django.db import models
from apps.core.models import BaseModel
from apps.exercicio.enums import NivelEnum
from apps.paciente.models import Paciente


class Exercicio(BaseModel):
    nivel = models.CharField(
        max_length=3,
        choices=NivelEnum.choices,
        verbose_name="Nível"
    )
    categoria = models.CharField(max_length=50, verbose_name="Categoria")
    conteudo = models.TextField(verbose_name="Conteúdo")
    objetivo = models.TextField(verbose_name="Objetivo")
    instrucao = models.TextField(verbose_name="Instrução")
    paciente = models.ManyToManyField(
        Paciente,
        blank=True,
        verbose_name="Pacientes",
        related_name="exercicios"
    )
    concluido = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Exercício"
        verbose_name_plural = "Exercícios"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.categoria} - {self.nivel}"


class ConteudoExercicio(models.Model):
    exercicio = models.ForeignKey(
        Exercicio,
        related_name="conteudos",
        on_delete=models.CASCADE
    )
    texto = models.CharField(max_length=255)
    instrucao = models.TextField()

    def __str__(self):
        return self.texto

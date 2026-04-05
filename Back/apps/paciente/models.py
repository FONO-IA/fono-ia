from django.db import models


class Paciente(models.Model):

    id = models.AutoField(primary_key=True, verbose_name="ID")
    nome = models.CharField(max_length=255, verbose_name="Nome completo")
    data_nascimento = models.DateField(verbose_name="Data de nascimento")
    observacoes = models.TextField(
        blank=True, null=True, verbose_name="Observações"
    )

    class Meta:
        verbose_name = "Paciente"
        verbose_name_plural = "Pacientes"
        ordering = ['-id']

    def __str__(self):
        return self.nome

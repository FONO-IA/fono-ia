from django.db import models


class Fonoaudiologo(models.Model):

    id = models.AutoField(primary_key=True, verbose_name="ID")
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
    data_cadastro = models.DateTimeField(
        auto_now_add=True, verbose_name="Data de cadastro"
    )

    class Meta:
        verbose_name = "Fonoaudiólogo"
        verbose_name_plural = "Fonoaudiólogos"
        ordering = ['-data_cadastro']

    def __str__(self):
        return self.nome

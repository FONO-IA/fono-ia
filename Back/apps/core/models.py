from django.db import models
from uuid import uuid4


# Create your models here.
class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modificado em"
    )
    is_deleted = models.BooleanField(
        default=True,
        verbose_name="Foi deletado?"
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.__class__.__name__} - {self.id}"

    def soft_delete(self):
        """Soft delete instead of actual deletion"""
        self.is_deleted = False
        self.save()

    def restore(self):
        """Restore a soft deleted instance"""
        self.is_deleted = True
        self.save()


class Fonoaudiologo(models.Model):

    id = models.AutoField(primary_key=True, verbose_name="ID")
    nome = models.CharField(max_length=255, verbose_name="Nome completo")
    cpf = models.CharField(max_length=14, unique=True, verbose_name="CPF")
    crfa = models.CharField(max_length=20, unique=True, verbose_name="CRFa")
    telefone = models.CharField(max_length=20, verbose_name="Telefone")
    email = models.EmailField(
        max_length=255, unique=True, verbose_name="Email"
    )
    data_cadastro = models.DateTimeField(
        auto_now_add=True, verbose_name="Data de cadastro"
    )

    class Meta:
        verbose_name = "Fonoaudiólogo"
        verbose_name_plural = "Fonoaudiólogos"
        ordering = ['-data_cadastro']

    def __str__(self):
        return f"{self.nome} - {self.cpf}"

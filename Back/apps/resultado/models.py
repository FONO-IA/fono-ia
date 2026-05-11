from django.db import models
from apps.core.models import BaseModel
from apps.exercicio.models import Exercicio


class Resultado(BaseModel):
    feedback = models.JSONField()
    audio = models.FileField(
        upload_to='respostas_audio/',
        null=True,
        blank=True,
    )
    exercicio = models.ForeignKey(
        Exercicio,
        on_delete=models.PROTECT,
        related_name='resultados'
    )

    def __str__(self):
        return f"Resultado do exercício {self.exercicio_id}"

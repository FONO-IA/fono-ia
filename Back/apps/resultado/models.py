from django.db import models
from apps.core.models import BaseModel
from apps.exercicio.models import Exercicio


class Resultado(BaseModel):
    feedback = models.JSONField()
    exercicio = models.ForeignKey(
        Exercicio,
        on_delete=models.PROTECT,
        related_name='resultados'
    )

    def __str__(self):
        return f"Resultado do exercício {self.exercicio_id}"

from django.db import models


class NivelEnum(models.TextChoices):
    FAC = 'FAC', 'Fácil'
    MED = 'MED', 'Médio'
    DIF = 'DIF', 'Difícil'

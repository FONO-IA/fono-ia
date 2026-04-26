from django.db.models import TextChoices


class NivelEnum(TextChoices):
    FACIL = 'FAC', 'Fácil'
    MEDIO = 'MED', 'Médio'
    DIFICIL = 'DIF', 'Difícil'

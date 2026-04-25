from django.db import models


class AcessoEnum(models.TextChoices):
    FONOAUDIOLOGO = 'FON', 'Fonoaudiólogo'
    PACIENTE = 'PAC', 'Paciente'

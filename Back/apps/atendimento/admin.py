from django.contrib import admin
from .models import Atendimento


@admin.register(Atendimento)
class AtendimentoAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'fonoaudiologo', 'exercicio', 'updated_at')
    search_fields = ('paciente__nome', 'fonoaudiologo__nome')

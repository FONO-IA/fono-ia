from django.contrib import admin
from apps.paciente.models import Paciente


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'data_nascimento', 'responsavel', 'observacoes']
    list_filter = ['data_nascimento', 'responsavel']
    search_fields = ['nome', 'observacoes', 'responsavel__nome']
    readonly_fields = ['id']
    ordering = ['-id']

    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'data_nascimento', 'responsavel', 'fonoaudiologo', 'observacoes')
        }),
        ('Informações do Sistema', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
    )
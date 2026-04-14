from django.contrib import admin
from apps.paciente.models import Paciente


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'data_nascimento', 'observacoes']
    list_filter = ['data_nascimento']
    search_fields = ['nome', 'data_nascimento', 'observacoes']
    readonly_fields = ['id']
    ordering = ['-id']

    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'data_nascimento', 'observacoes')
        }),
        ('Informações do Sistema', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
    )

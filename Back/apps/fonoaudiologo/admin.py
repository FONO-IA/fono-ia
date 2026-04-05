from django.contrib import admin
from apps.fonoaudiologo.models import Fonoaudiologo


@admin.register(Fonoaudiologo)
class FonoaudiologoAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'nome', 'cpf', 'crfa', 'email', 'telefone', 'data_cadastro'
    ]
    list_filter = ['data_cadastro']
    search_fields = ['nome', 'cpf', 'crfa', 'email', 'telefone']
    readonly_fields = ['id', 'data_cadastro']
    ordering = ['-data_cadastro']

    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'cpf', 'email', 'telefone')
        }),
        ('Informações Profissionais', {
            'fields': ('crfa',)
        }),
        ('Informações do Sistema', {
            'fields': ('id', 'data_cadastro'),
            'classes': ('collapse',)
        }),
    )

from django.contrib import admin
from apps.fonoaudiologo.models import Fonoaudiologo


@admin.register(Fonoaudiologo)
class FonoaudiologoAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'nome', 'cpf', 'crfa', 'email', 'telefone', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = ['nome', 'cpf', 'crfa', 'email', 'telefone']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'cpf', 'email', 'telefone')
        }),
        ('Informações Profissionais', {
            'fields': ('crfa',)
        }),
        ('Informações do Sistema', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
    )

from django.contrib import admin
from apps.responsavel.models import Responsavel


@admin.register(Responsavel)
class ResponsavelAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'cpf', 'email', 'telefone']
    list_filter = ['cpf']
    search_fields = ['nome', 'cpf', 'email', 'telefone']
    readonly_fields = ['id']
    ordering = ['-id']

    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'cpf', 'email', 'telefone')
        }),
        ('Informações do Sistema', {
            'fields': ('id',),
            'classes': ('collapse',)
        }),
    )

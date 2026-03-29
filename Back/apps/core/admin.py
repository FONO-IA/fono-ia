from django.contrib import admin
from apps.core.models import Fonoaudiologo, Responsavel


@admin.register(Fonoaudiologo)
class FonoaudiologoAdmin(admin.ModelAdmin):

    list_display = ['id', 'nome', 'cpf', 'crfa', 'telefone', 'data_cadastro']
    list_filter = ['data_cadastro']
    search_fields = ['nome', 'cpf', 'crfa', 'telefone']
    readonly_fields = ['id', 'data_cadastro']
    ordering = ['-data_cadastro']

    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('nome', 'cpf', 'telefone')
        }),
        ('Informações Profissionais', {
            'fields': ('crfa',)
        }),
        ('Informações do Sistema', {
            'fields': ('id', 'data_cadastro'),
            'classes': ('collapse',)
        }),
    )


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

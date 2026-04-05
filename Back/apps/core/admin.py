from django.contrib import admin
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.responsavel.models import Responsavel
from apps.paciente.models import Paciente


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

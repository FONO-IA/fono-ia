from django.contrib import admin
from .models import Exercicio


@admin.register(Exercicio)
class ExercicioAdmin(admin.ModelAdmin):
    list_display = ('id', 'nivel', 'categoria', 'objetivo')
    search_fields = ('nivel', 'categoria')

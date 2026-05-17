from django.contrib import admin
from .models import Exercicio, ConteudoExercicio


class ConteudoExercicioInline(admin.TabularInline):
    model = ConteudoExercicio
    extra = 1


@admin.register(Exercicio)
class ExercicioAdmin(admin.ModelAdmin):
    list_display = ('id', 'nivel', 'categoria', 'objetivo')
    search_fields = ('nivel', 'categoria')
    inlines = [ConteudoExercicioInline]

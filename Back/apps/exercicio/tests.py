from django.test import TestCase
from .models import Exercicio


class ExercicioModelTest(TestCase):
    def test_criacao_exercicio(self):
        exercicio = Exercicio.objects.create(
            nivel='Fácil',
            categoria='Leitura',
            conteudo='Texto de exemplo',
            objetivo='Melhorar leitura',
            instrucao='Leia o texto em voz alta.'
        )
        self.assertEqual(exercicio.nivel, 'Fácil')
        self.assertEqual(exercicio.categoria, 'Leitura')

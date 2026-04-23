from django.test import TestCase
from .models import Exercicio


class ExercicioModelTest(TestCase):
    def test_criacao_exercicio(self):
        exercicio = Exercicio.objects.create(
            nivel='FAC',
            categoria='Leitura',
            conteudo='Texto de exemplo',
            objetivo='Melhorar leitura',
            instrucao='Leia o texto em voz alta.'
        )
        self.assertEqual(exercicio.nivel, 'FAC')
        self.assertEqual(exercicio.categoria, 'Leitura')

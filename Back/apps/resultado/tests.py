from django.test import TestCase
from apps.exercicio.models import Exercicio
from .models import Resultado


class ResultadoModelTest(TestCase):
    def test_criacao_resultado(self):
        exercicio = Exercicio.objects.create(
            nivel='MED',
            categoria='Escrita',
            conteudo='Outro texto',
            objetivo='Melhorar escrita',
            instrucao='Escreva o texto.'
        )
        feedback = {'acertos': 5, 'erros': 2}
        resultado = Resultado.objects.create(
            exercicio=exercicio,
            feedback=feedback
        )
        self.assertEqual(resultado.feedback['acertos'], 5)
        self.assertEqual(resultado.exercicio, exercicio)

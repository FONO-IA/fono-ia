from django.test import TestCase

# Create your tests here.
from django.test import TestCase

from apps.atendimento.models import Atendimento
from apps.exercicio.models import Exercicio
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.paciente.models import Paciente
from apps.responsavel.models import Responsavel


class AtendimentoModelTest(TestCase):
    def setUp(self):
        self.responsavel = Responsavel.objects.create(
            nome='Responsável Teste',
            cpf='12345678901',
            email='responsavel@email.com',
            telefone='83999990000'
        )

        self.paciente = Paciente.objects.create(
            nome='Paciente Teste',
            data_nascimento='2015-05-10',
            responsavel=self.responsavel
        )

        self.fonoaudiologo = Fonoaudiologo.objects.create(
            nome='Fono Teste',
            cpf='98765432100',
            crfa='12345',
            telefone='83988887777',
            email='fono@email.com'
        )

        self.exercicio = Exercicio.objects.create(
            nivel='FAC',
            categoria='Leitura',
            conteudo='Texto base',
            objetivo='Melhorar leitura',
            instrucao='Leia com atenção.'
        )

    def test_criacao_atendimento(self):
        atendimento = Atendimento.objects.create(
            paciente=self.paciente,
            fonoaudiologo=self.fonoaudiologo,
            exercicio=self.exercicio,
            observacoes='Primeira sessão'
        )

        self.assertEqual(atendimento.paciente, self.paciente)
        self.assertEqual(atendimento.fonoaudiologo, self.fonoaudiologo)
        self.assertEqual(atendimento.exercicio, self.exercicio)
        self.assertEqual(atendimento.observacoes, 'Primeira sessão')
        self.assertFalse(atendimento.concluido)

    def test_atendimento_inicia_nao_concluido_por_padrao(self):
        atendimento = Atendimento.objects.create(
            paciente=self.paciente,
            fonoaudiologo=self.fonoaudiologo,
            exercicio=self.exercicio
        )

        self.assertFalse(atendimento.concluido)
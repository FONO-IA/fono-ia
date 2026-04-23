from django.test import TestCase

from apps.paciente.api.v1.serializer import PacienteSerializer
from apps.paciente.models import Paciente
from apps.responsavel.models import Responsavel


class PacienteModelTest(TestCase):
    def setUp(self):
        self.responsavel = Responsavel.objects.create(
            nome='Responsável Teste',
            cpf='12345678901',
            email='responsavel@email.com',
            telefone='83999990000'
        )

    def test_criacao_paciente(self):
        paciente = Paciente.objects.create(
            nome='Ana Clara',
            data_nascimento='2016-08-15',
            observacoes='Paciente em acompanhamento',
            responsavel=self.responsavel
        )

        self.assertEqual(paciente.nome, 'Ana Clara')
        self.assertEqual(paciente.responsavel, self.responsavel)
        self.assertEqual(str(paciente), 'Ana Clara')


class PacienteSerializerTest(TestCase):
    def setUp(self):
        self.responsavel = Responsavel.objects.create(
            nome='Responsável Teste',
            cpf='98765432100',
            email='resp2@email.com',
            telefone='83988887777'
        )

    def test_serializer_valido(self):
        data = {
            'nome': 'Pedro Henrique',
            'data_nascimento': '2014-04-20',
            'observacoes': 'Sem observações',
            'responsavel': self.responsavel.id
        }

        serializer = PacienteSerializer(data=data)

        self.assertTrue(serializer.is_valid())

    def test_nome_obrigatorio(self):
        data = {
            'nome': '   ',
            'data_nascimento': '2014-04-20',
            'observacoes': 'Sem observações',
            'responsavel': self.responsavel.id
        }

        serializer = PacienteSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn('nome', serializer.errors)
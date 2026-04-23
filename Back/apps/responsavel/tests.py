from django.test import TestCase

from apps.responsavel.api.v1.serializer import ResponsavelSerializer
from apps.responsavel.models import Responsavel


class ResponsavelModelTest(TestCase):
    def test_criacao_responsavel(self):
        responsavel = Responsavel.objects.create(
            nome='Maria Silva',
            cpf='12345678901',
            email='maria@email.com',
            telefone='83999999999'
        )

        self.assertEqual(responsavel.nome, 'Maria Silva')
        self.assertEqual(responsavel.cpf, '12345678901')
        self.assertEqual(str(responsavel), 'Maria Silva')


class ResponsavelSerializerTest(TestCase):
    def test_serializer_valido(self):
        data = {
            'nome': 'Carlos Souza',
            'cpf': '12345678901',
            'email': 'carlos@email.com',
            'telefone': '83999998888'
        }

        serializer = ResponsavelSerializer(data=data)

        self.assertTrue(serializer.is_valid())

    def test_serializer_cpf_invalido(self):
        data = {
            'nome': 'Carlos Souza',
            'cpf': '12345',
            'email': 'carlos@email.com',
            'telefone': '83999998888'
        }

        serializer = ResponsavelSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn('cpf', serializer.errors)

    def test_serializer_cpf_obrigatorio(self):
        data = {
            'nome': 'Carlos Souza',
            'cpf': '',
            'email': 'carlos@email.com',
            'telefone': '83999998888'
        }

        serializer = ResponsavelSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn('cpf', serializer.errors)
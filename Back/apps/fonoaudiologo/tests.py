from django.test import TestCase

from apps.fonoaudiologo.api.v1.serializer import FonoaudiologoSerializer
from apps.fonoaudiologo.models import Fonoaudiologo


class FonoaudiologoModelTest(TestCase):
    def test_criacao_fonoaudiologo(self):
        fonoaudiologo = Fonoaudiologo.objects.create(
            nome='Fernanda Lima',
            cpf='12345678901',
            crfa='12345',
            telefone='83999998888',
            email='fernanda@email.com'
        )

        self.assertEqual(fonoaudiologo.nome, 'Fernanda Lima')
        self.assertEqual(fonoaudiologo.crfa, '12345')
        self.assertEqual(str(fonoaudiologo), 'Fernanda Lima')


class FonoaudiologoSerializerTest(TestCase):
    def test_serializer_valido(self):
        data = {
            'nome': 'Fernanda Lima',
            'cpf': '12345678901',
            'crfa': '12345',
            'telefone': '83999998888',
            'email': 'fernanda@email.com'
        }

        serializer = FonoaudiologoSerializer(data=data)

        self.assertTrue(serializer.is_valid())

    def test_serializer_cpf_invalido(self):
        data = {
            'nome': 'Fernanda Lima',
            'cpf': '123',
            'crfa': '12345',
            'telefone': '83999998888',
            'email': 'fernanda@email.com'
        }

        serializer = FonoaudiologoSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn('cpf', serializer.errors)

    def test_serializer_crfa_obrigatorio(self):
        data = {
            'nome': 'Fernanda Lima',
            'cpf': '12345678901',
            'crfa': '',
            'telefone': '83999998888',
            'email': 'fernanda@email.com'
        }

        serializer = FonoaudiologoSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn('crfa', serializer.errors)
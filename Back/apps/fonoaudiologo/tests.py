from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase

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


class FonoaudiologoViewSetTest(APITestCase):
    def test_create_cria_grupo_fonoaudiologo_quando_ausente(self):
        Group.objects.filter(name='Fonoaudiologo').delete()

        payload = {
            'nome': 'Fernanda Lima',
            'cpf': '12345678901',
            'crfa': '12345',
            'telefone': '83999998888',
            'email': 'fernanda@email.com',
            'username': 'fernanda@email.com',
            'password': 'senha-forte-123',
        }

        response = self.client.post(
            '/api/v1/fonoaudiologos/',
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Group.objects.filter(name='Fonoaudiologo').exists()
        )
        self.assertEqual(Fonoaudiologo.objects.count(), 1)

        user = get_user_model().objects.get(username='fernanda@email.com')
        self.assertTrue(user.groups.filter(name='Fonoaudiologo').exists())

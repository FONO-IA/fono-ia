from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.fonoaudiologo.models import Fonoaudiologo
from apps.paciente.models import Paciente
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


class ResponsavelEndpointTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.client = APIClient()

        self.responsavel_user = User.objects.create_user(
            username='resp-me',
            email='resp-me@email.com',
            password='12345'
        )
        self.outro_responsavel_user = User.objects.create_user(
            username='outro-resp-me',
            email='outro-resp-me@email.com',
            password='12345'
        )
        self.fono_user = User.objects.create_user(
            username='fono-resp-me',
            email='fono-resp-me@email.com',
            password='12345'
        )

        self.responsavel = Responsavel.objects.create(
            user=self.responsavel_user,
            nome='Maria Endpoint',
            cpf='44444444444',
            email='resp-me@email.com',
            telefone='83999990005'
        )
        self.outro_responsavel = Responsavel.objects.create(
            user=self.outro_responsavel_user,
            nome='Outra Maria',
            cpf='55555555555',
            email='outro-resp-me@email.com',
            telefone='83999990006'
        )
        self.fonoaudiologo = Fonoaudiologo.objects.create(
            user=self.fono_user,
            nome='Fono Responsavel Endpoint',
            cpf='66666666666',
            crfa='CRFA-RESP-1',
            telefone='83999990007',
            email='fono-resp-me@email.com'
        )
        self.paciente = Paciente.objects.create(
            nome='Paciente Vinculado',
            data_nascimento='2018-05-10',
            observacoes='Teste',
            responsavel=self.responsavel,
            fonoaudiologo=self.fonoaudiologo
        )
        Paciente.objects.create(
            nome='Paciente de Outro Responsavel',
            data_nascimento='2019-06-12',
            observacoes='Teste',
            responsavel=self.outro_responsavel,
            fonoaudiologo=self.fonoaudiologo
        )

    def test_me_retorna_responsavel_logado(self):
        self.client.force_authenticate(user=self.responsavel_user)

        response = self.client.get('/api/v1/responsaveis/me/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(str(response.data['id']), str(self.responsavel.id))
        self.assertEqual(response.data['nome'], self.responsavel.nome)

    def test_me_pacientes_retorna_apenas_vinculados(self):
        self.client.force_authenticate(user=self.responsavel_user)

        response = self.client.get('/api/v1/responsaveis/me/pacientes/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(str(response.data[0]['id']), str(self.paciente.id))

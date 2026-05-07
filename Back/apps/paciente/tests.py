from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.exercicio.models import Exercicio
from apps.fonoaudiologo.models import Fonoaudiologo
from apps.paciente.api.v1.serializer import PacienteSerializer
from apps.paciente.models import Paciente
from apps.responsavel.models import Responsavel
from apps.resultado.models import Resultado


class PacienteModelTest(TestCase):
    def setUp(self):
        self.fonoaudiologo = Fonoaudiologo.objects.create(
            nome='Fono Teste',
            cpf='12345678909',
            crfa='CRFA-TESTE-1',
            telefone='83999990001',
            email='fono@email.com'
        )
        self.responsavel = Responsavel.objects.create(
            nome='Responsavel Teste',
            cpf='12345678901',
            email='responsavel@email.com',
            telefone='83999990000'
        )

    def test_criacao_paciente(self):
        paciente = Paciente.objects.create(
            nome='Ana Clara',
            data_nascimento='2016-08-15',
            observacoes='Paciente em acompanhamento',
            responsavel=self.responsavel,
            fonoaudiologo=self.fonoaudiologo
        )

        self.assertEqual(paciente.nome, 'Ana Clara')
        self.assertEqual(paciente.responsavel, self.responsavel)
        self.assertEqual(str(paciente), 'Ana Clara')


class PacienteSerializerTest(TestCase):
    def setUp(self):
        self.responsavel = Responsavel.objects.create(
            nome='Responsavel Teste',
            cpf='98765432100',
            email='resp2@email.com',
            telefone='83988887777'
        )

    def test_serializer_valido(self):
        data = {
            'nome': 'Pedro Henrique',
            'data_nascimento': '2014-04-20',
            'observacoes': 'Sem observacoes',
            'responsavel': self.responsavel.id
        }

        serializer = PacienteSerializer(data=data)

        self.assertTrue(serializer.is_valid())

    def test_nome_obrigatorio(self):
        data = {
            'nome': '',
            'data_nascimento': '2014-04-20',
            'observacoes': 'Sem observacoes',
            'responsavel': self.responsavel.id
        }

        serializer = PacienteSerializer(data=data)

        self.assertFalse(serializer.is_valid())
        self.assertIn('nome', serializer.errors)


class PacienteExerciciosEndpointTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.client = APIClient()

        self.responsavel_user = User.objects.create_user(
            username='responsavel',
            email='responsavel@endpoint.com',
            password='12345'
        )
        self.outro_responsavel_user = User.objects.create_user(
            username='outro-responsavel',
            email='outro-responsavel@endpoint.com',
            password='12345'
        )
        self.fono_user = User.objects.create_user(
            username='fono',
            email='fono@endpoint.com',
            password='12345'
        )

        self.responsavel = Responsavel.objects.create(
            user=self.responsavel_user,
            nome='Responsavel Endpoint',
            cpf='11111111111',
            email='responsavel@endpoint.com',
            telefone='83999990002'
        )
        self.outro_responsavel = Responsavel.objects.create(
            user=self.outro_responsavel_user,
            nome='Outro Responsavel',
            cpf='22222222222',
            email='outro-responsavel@endpoint.com',
            telefone='83999990003'
        )
        self.fonoaudiologo = Fonoaudiologo.objects.create(
            user=self.fono_user,
            nome='Fono Endpoint',
            cpf='33333333333',
            crfa='CRFA-ENDPOINT-1',
            telefone='83999990004',
            email='fono@endpoint.com'
        )

        self.paciente = Paciente.objects.create(
            nome='Paciente Endpoint',
            data_nascimento='2018-05-10',
            observacoes='Teste',
            responsavel=self.responsavel,
            fonoaudiologo=self.fonoaudiologo
        )
        self.outro_paciente = Paciente.objects.create(
            nome='Outro Paciente',
            data_nascimento='2017-04-20',
            observacoes='Teste',
            responsavel=self.outro_responsavel,
            fonoaudiologo=self.fonoaudiologo
        )
        self.exercicio = Exercicio.objects.create(
            nivel='FAC',
            categoria='Voz',
            conteudo='Vogais',
            objetivo='Treinar vogais',
            instrucao='Repita as vogais',
            concluido=False
        )
        self.exercicio.paciente.add(self.paciente)

    def test_responsavel_lista_exercicios_do_paciente_vinculado(self):
        self.client.force_authenticate(user=self.responsavel_user)

        response = self.client.get(
            f'/api/v1/pacientes/{self.paciente.id}/exercicios/'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(str(response.data[0]['id']), str(self.exercicio.id))

    def test_responsavel_nao_acessa_paciente_de_outro_responsavel(self):
        self.client.force_authenticate(user=self.responsavel_user)

        response = self.client.get(
            f'/api/v1/pacientes/{self.outro_paciente.id}/exercicios/'
        )

        self.assertEqual(response.status_code, 403)

    def test_fono_lista_exercicios_do_paciente_vinculado(self):
        self.client.force_authenticate(user=self.fono_user)

        response = self.client.get(
            f'/api/v1/pacientes/{self.paciente.id}/exercicios/'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_progresso_calcula_exercicios_concluidos(self):
        Resultado.objects.create(
            exercicio=self.exercicio,
            feedback={'status': 'concluido'}
        )
        self.client.force_authenticate(user=self.responsavel_user)

        response = self.client.get(
            f'/api/v1/pacientes/{self.paciente.id}/progresso/'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_exercicios'], 1)
        self.assertEqual(response.data['concluidos'], 1)
        self.assertEqual(response.data['progresso'], 100)

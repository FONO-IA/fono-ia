from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from apps.fonoaudiologo.models import Fonoaudiologo
from apps.paciente.models import Paciente
from apps.responsavel.models import Responsavel
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


class ExercicioResponderEndpointTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.client = APIClient()
        self.responsavel_user = User.objects.create_user(
            username='resp-exercicio',
            email='resp-exercicio@email.com',
            password='12345'
        )
        self.outro_user = User.objects.create_user(
            username='outro-exercicio',
            email='outro-exercicio@email.com',
            password='12345'
        )
        self.fono_user = User.objects.create_user(
            username='fono-exercicio',
            email='fono-exercicio@email.com',
            password='12345'
        )
        self.responsavel = Responsavel.objects.create(
            user=self.responsavel_user,
            nome='Resp Exercicio',
            cpf='77777777777',
            email='resp-exercicio@email.com',
            telefone='83999990008'
        )
        self.outro_responsavel = Responsavel.objects.create(
            user=self.outro_user,
            nome='Outro Resp Exercicio',
            cpf='88888888888',
            email='outro-exercicio@email.com',
            telefone='83999990009'
        )
        self.fono = Fonoaudiologo.objects.create(
            user=self.fono_user,
            nome='Fono Exercicio',
            cpf='99999999999',
            crfa='CRFA-EX-1',
            telefone='83999990010',
            email='fono-exercicio@email.com'
        )
        self.paciente = Paciente.objects.create(
            nome='Paciente Exercicio',
            data_nascimento='2018-05-10',
            observacoes='Teste',
            responsavel=self.responsavel,
            fonoaudiologo=self.fono
        )
        self.outro_paciente = Paciente.objects.create(
            nome='Outro Paciente Exercicio',
            data_nascimento='2017-05-10',
            observacoes='Teste',
            responsavel=self.outro_responsavel,
            fonoaudiologo=self.fono
        )
        self.exercicio = Exercicio.objects.create(
            nivel='FAC',
            categoria='Voz',
            conteudo='A',
            objetivo='Treinar vogal',
            instrucao='Fale a vogal',
            concluido=False
        )
        self.exercicio.paciente.add(self.paciente)

    def test_responsavel_responde_exercicio_vinculado(self):
        self.client.force_authenticate(user=self.responsavel_user)
        audio = SimpleUploadedFile(
            'resposta.webm',
            b'audio',
            content_type='audio/webm'
        )

        response = self.client.post(
            f'/api/v1/exercicios/{self.exercicio.id}/responder/',
            {'audio': audio, 'paciente_id': str(self.paciente.id)},
            format='multipart'
        )

        self.assertEqual(response.status_code, 201)
        self.exercicio.refresh_from_db()
        self.assertTrue(self.exercicio.concluido)

    def test_responsavel_nao_responde_exercicio_de_outro_paciente(self):
        self.client.force_authenticate(user=self.outro_user)
        audio = SimpleUploadedFile(
            'resposta.webm',
            b'audio',
            content_type='audio/webm'
        )

        response = self.client.post(
            f'/api/v1/exercicios/{self.exercicio.id}/responder/',
            {'audio': audio, 'paciente_id': str(self.outro_paciente.id)},
            format='multipart'
        )

        self.assertEqual(response.status_code, 404)

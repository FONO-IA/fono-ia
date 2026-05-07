from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from apps.fonoaudiologo.models import Fonoaudiologo
from apps.paciente.models import Paciente
from apps.responsavel.models import Responsavel
from .models import ConteudoExercicio, Exercicio


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
        self.fono_sem_vinculo_user = User.objects.create_user(
            username='fono-sem-vinculo',
            email='fono-sem-vinculo@email.com',
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
        self.fono_sem_vinculo = Fonoaudiologo.objects.create(
            user=self.fono_sem_vinculo_user,
            nome='Fono Sem Vinculo',
            cpf='99999999998',
            crfa='CRFA-EX-2',
            telefone='83999990011',
            email='fono-sem-vinculo@email.com'
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

    def test_responsavel_visualiza_exercicio_vinculado(self):
        self.client.force_authenticate(user=self.responsavel_user)

        response = self.client.get(
            f'/api/v1/exercicios/{self.exercicio.id}/'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], str(self.exercicio.id))

    def test_responsavel_nao_visualiza_exercicio_de_outro_paciente(self):
        self.client.force_authenticate(user=self.outro_user)

        response = self.client.get(
            f'/api/v1/exercicios/{self.exercicio.id}/'
        )

        self.assertEqual(response.status_code, 403)

    def test_fono_visualiza_exercicio_de_paciente_vinculado(self):
        self.client.force_authenticate(user=self.fono_user)

        response = self.client.get(
            f'/api/v1/exercicios/{self.exercicio.id}/'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], str(self.exercicio.id))

    def test_fono_nao_visualiza_exercicio_de_paciente_sem_vinculo(self):
        self.client.force_authenticate(user=self.fono_sem_vinculo_user)

        response = self.client.get(
            f'/api/v1/exercicios/{self.exercicio.id}/'
        )

        self.assertEqual(response.status_code, 403)

    def test_cria_exercicio_com_multiplas_palavras(self):
        self.client.force_authenticate(user=self.fono_user)

        response = self.client.post(
            '/api/v1/exercicios/',
            {
                'nivel': 'FAC',
                'categoria': 'Fonemas',
                'conteudo': 'casa, bola, sapo',
                'objetivo': 'Treinar palavras curtas',
                'instrucao': 'Repita com calma',
                'paciente': [self.paciente.id],
                'palavras': ['casa', 'bola', 'sapo'],
            },
            format='json'
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['palavras'], ['casa', 'bola', 'sapo'])
        self.assertEqual(
            ConteudoExercicio.objects.filter(
                exercicio_id=response.data['id']
            ).count(),
            3
        )

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

        self.assertEqual(response.status_code, 403)

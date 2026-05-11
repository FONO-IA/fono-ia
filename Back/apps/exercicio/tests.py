import json
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.fonoaudiologo.models import Fonoaudiologo
from apps.paciente.models import Paciente
from apps.responsavel.models import Responsavel
from apps.resultado.models import Resultado
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
        self.conteudo_a = ConteudoExercicio.objects.create(
            exercicio=self.exercicio,
            texto='A',
            instrucao='Fale a vogal',
        )

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
        self.assertEqual(response.data['nome'], 'Exercicio de pronuncia - Fonemas')
        self.assertEqual(
            ConteudoExercicio.objects.filter(
                exercicio_id=response.data['id']
            ).count(),
            3
        )

    def test_cria_exercicio_com_conteudos_do_formulario(self):
        self.client.force_authenticate(user=self.fono_user)

        response = self.client.post(
            '/api/v1/exercicios/',
            {
                'nivel': 'MED',
                'categoria': 'Frutas',
                'conteudo': 'banana, uva',
                'objetivo': 'Treinar pronuncia com frutas',
                'instrucao': 'Repita cada palavra com calma',
                'paciente': [str(self.paciente.id)],
                'palavras': ['banana', 'uva'],
                'conteudos': [
                    {
                        'texto': 'banana',
                        'instrucao': 'Repita banana devagar',
                    },
                    {
                        'texto': 'uva',
                        'instrucao': 'Repita uva devagar',
                    },
                ],
            },
            format='json'
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['palavras'], ['banana', 'uva'])
        conteudos = ConteudoExercicio.objects.filter(
            exercicio_id=response.data['id']
        )
        self.assertEqual(conteudos.count(), 2)
        self.assertTrue(
            conteudos.filter(
                texto='banana',
                instrucao='Repita banana devagar',
            ).exists()
        )

    def test_cria_exercicio_salva_palavras_a_partir_do_conteudo(self):
        self.client.force_authenticate(user=self.fono_user)

        response = self.client.post(
            '/api/v1/exercicios/',
            {
                'nivel': 'FAC',
                'categoria': 'Frutas',
                'conteudo': 'banana, uva, maçã',
                'objetivo': 'Treinar palavras de frutas',
                'instrucao': 'Repita cada palavra',
                'paciente': [str(self.paciente.id)],
            },
            format='json'
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['palavras'], ['banana', 'uva', 'maçã'])
        self.assertEqual(
            list(
                ConteudoExercicio.objects.filter(
                    exercicio_id=response.data['id']
                ).values_list('texto', flat=True)
            ),
            ['banana', 'uva', 'maçã']
        )

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    def test_cria_exercicio_com_dica_visual_por_palavra(self):
        self.client.force_authenticate(user=self.fono_user)
        imagem = SimpleUploadedFile(
            'banana.png',
            b'fake-png',
            content_type='image/png'
        )

        response = self.client.post(
            '/api/v1/exercicios/',
            {
                'nivel': 'FAC',
                'categoria': 'Frutas',
                'conteudo': 'banana',
                'objetivo': 'Treinar palavra com apoio visual',
                'instrucao': 'Repita a palavra',
                'paciente': json.dumps([str(self.paciente.id)]),
                'palavras': json.dumps(['banana']),
                'conteudos': json.dumps([
                    {
                        'texto': 'banana',
                        'instrucao': 'Olhe a imagem e repita banana',
                    },
                ]),
                'dica_visual_0': imagem,
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['conteudos'][0]['dica_visual_url'])
        conteudo = ConteudoExercicio.objects.get(
            exercicio_id=response.data['id'],
            texto='banana'
        )
        self.assertTrue(conteudo.dica_visual.name.endswith('.png'))

    @override_settings(GROQ_API_KEY='', AI_PROVIDER='groq')
    def test_ia_sugestao_retorna_texto_com_cinco_palavras(self):
        self.client.force_authenticate(user=self.fono_user)

        response = self.client.post(
            '/api/v1/exercicios/ia-sugestao/',
            {
                'categoria': 'frutas',
                'nivel': 'Fácil',
                'objetivo': 'trabalhar sons com R',
            },
            format='json'
        )

        self.assertEqual(response.status_code, 200)
        sugestao = response.data['sugestao']
        self.assertIn('Palavras sugeridas:', sugestao)
        palavras = [
            line for line in sugestao.splitlines()
            if line.startswith('- ')
        ]
        self.assertEqual(
            palavras,
            ['- banana', '- uva', '- maçã', '- mamão', '- limão']
        )

    def test_ia_sugestao_exige_categoria(self):
        self.client.force_authenticate(user=self.fono_user)

        response = self.client.post(
            '/api/v1/exercicios/ia-sugestao/',
            {'categoria': ''},
            format='json'
        )

        self.assertEqual(response.status_code, 400)

    def test_ia_sugestao_bloqueia_responsavel(self):
        self.client.force_authenticate(user=self.responsavel_user)

        response = self.client.post(
            '/api/v1/exercicios/ia-sugestao/',
            {'categoria': 'frutas'},
            format='json'
        )

        self.assertEqual(response.status_code, 403)

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    def test_responsavel_responde_exercicio_vinculado(self):
        self.client.force_authenticate(user=self.responsavel_user)
        audio = SimpleUploadedFile(
            'resposta.wav',
            b'RIFF....WAVEfmt ',
            content_type='audio/wav'
        )

        response = self.client.post(
            f'/api/v1/exercicios/{self.exercicio.id}/responder/',
            {
                'audio': audio,
                'paciente_id': str(self.paciente.id),
                'palavra_alvo': 'A',
                'conteudo_id': str(self.conteudo_a.id),
                'transcricao': 'A',
                'correto': 'true',
                'similaridade': '1',
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, 201)
        self.exercicio.refresh_from_db()
        self.assertTrue(self.exercicio.concluido)
        self.assertTrue(response.data['feedback']['correto'])
        self.assertEqual(response.data['feedback']['palavra_alvo'], 'A')
        self.assertTrue(response.data['audio_url'].endswith('.wav'))
        resultado = Resultado.objects.get(id=response.data['id'])
        self.assertTrue(resultado.audio.name.endswith('.wav'))

        self.client.force_authenticate(user=self.fono_user)
        detail_response = self.client.get(
            f'/api/v1/exercicios/{self.exercicio.id}/',
            {'paciente': str(self.paciente.id)}
        )
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.data['audio_url'], response.data['audio_url'])
        self.assertEqual(
            detail_response.data['conteudos'][0]['audio_url'],
            response.data['audio_url']
        )

        progress_response = self.client.get(
            f'/api/v1/pacientes/{self.paciente.id}/progresso/'
        )
        self.assertEqual(progress_response.status_code, 200)
        self.assertEqual(
            progress_response.data['resultados'][0]['audio_url'],
            response.data['audio_url']
        )

    @override_settings(MEDIA_ROOT=tempfile.gettempdir())
    def test_responder_substitui_gravacao_anterior_da_mesma_palavra(self):
        self.client.force_authenticate(user=self.responsavel_user)
        primeiro_audio = SimpleUploadedFile(
            'primeira.wav',
            b'RIFF....WAVEfmt primeira',
            content_type='audio/wav'
        )
        segundo_audio = SimpleUploadedFile(
            'segunda.wav',
            b'RIFF....WAVEfmt segunda',
            content_type='audio/wav'
        )

        primeira_resposta = self.client.post(
            f'/api/v1/exercicios/{self.exercicio.id}/responder/',
            {
                'audio': primeiro_audio,
                'paciente_id': str(self.paciente.id),
                'palavra_alvo': 'A',
                'conteudo_id': 'vogal-a',
                'transcricao': 'A',
                'correto': 'true',
                'similaridade': '1',
                'confianca': '0.98',
            },
            format='multipart'
        )
        primeiro_audio_salvo = Resultado.objects.get(
            id=primeira_resposta.data['id']
        ).audio.name
        segunda_resposta = self.client.post(
            f'/api/v1/exercicios/{self.exercicio.id}/responder/',
            {
                'audio': segundo_audio,
                'paciente_id': str(self.paciente.id),
                'palavra_alvo': 'A',
                'conteudo_id': 'vogal-a',
                'transcricao': 'A',
                'correto': 'true',
                'similaridade': '1',
                'confianca': '0.99',
            },
            format='multipart'
        )

        self.assertEqual(primeira_resposta.status_code, 201)
        self.assertEqual(segunda_resposta.status_code, 201)
        self.assertFalse(
            Resultado.objects.with_deleted().filter(
                id=primeira_resposta.data['id']
            ).exists()
        )
        self.assertFalse(default_storage.exists(primeiro_audio_salvo))
        self.assertTrue(
            Resultado.objects.filter(
                id=segunda_resposta.data['id'],
                exercicio=self.exercicio,
            ).exists()
        )
        self.assertEqual(
            Resultado.objects.filter(exercicio=self.exercicio).count(),
            1
        )

    def test_responsavel_nao_responde_exercicio_de_outro_paciente(self):
        self.client.force_authenticate(user=self.outro_user)
        audio = SimpleUploadedFile(
            'resposta.wav',
            b'audio',
            content_type='audio/wav'
        )

        response = self.client.post(
            f'/api/v1/exercicios/{self.exercicio.id}/responder/',
            {'audio': audio, 'paciente_id': str(self.outro_paciente.id)},
            format='multipart'
        )

        self.assertEqual(response.status_code, 403)

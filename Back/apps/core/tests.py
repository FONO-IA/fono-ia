from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.responsavel.models import Responsavel


class BaseModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='tester',
            password='123456'
        )

    def test_soft_delete_marca_registro_como_deletado(self):
        responsavel = Responsavel.objects.create(
            nome='Maria Silva',
            cpf='12345678901',
            email='maria@email.com',
            telefone='83999999999'
        )

        responsavel.soft_delete(user=self.user)
        responsavel.refresh_from_db()

        self.assertTrue(responsavel.is_deleted)
        self.assertIsNotNone(responsavel.deleted_at)
        self.assertEqual(responsavel.deleted_by, self.user)

    def test_restore_restaura_registro_soft_deleted(self):
        responsavel = Responsavel.objects.create(
            nome='João Souza',
            cpf='98765432100',
            email='joao@email.com',
            telefone='83888888888'
        )

        responsavel.soft_delete(user=self.user)
        responsavel.restore()
        responsavel.refresh_from_db()

        self.assertFalse(responsavel.is_deleted)
        self.assertIsNone(responsavel.deleted_at)
        self.assertIsNone(responsavel.deleted_by)

    def test_manager_objects_retorna_apenas_registros_ativos(self):
        ativo = Responsavel.objects.create(
            nome='Responsável Ativo',
            cpf='11111111111',
            email='ativo@email.com',
            telefone='83911111111'
        )
        deletado = Responsavel.objects.create(
            nome='Responsável Deletado',
            cpf='22222222222',
            email='deletado@email.com',
            telefone='83922222222'
        )

        deletado.soft_delete(user=self.user)

        self.assertIn(ativo, Responsavel.objects.all())
        self.assertNotIn(deletado, Responsavel.objects.all())
        self.assertIn(deletado, Responsavel.objects.with_deleted())
        self.assertIn(deletado, Responsavel.objects.only_deleted())
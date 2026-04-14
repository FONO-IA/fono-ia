from django.db import models
from uuid import uuid4
from django.utils import timezone
from django.conf import settings


class BaseQuerySet(models.QuerySet):
    def actives(self):
        return self.filter(is_deleted=False)

    def with_deleted(self):
        return self.all()

    def only_deleted(self):
        return self.filter(is_deleted=True)


class BaseManager(models.Manager):
    def get_queryset(self):
        return BaseQuerySet(
            self.model,
            using=self._db
        ).filter(is_deleted=False)

    def actives(self):
        return self.get_queryset()

    def with_deleted(self):
        return BaseQuerySet(self.model, using=self._db).all()

    def only_deleted(self):
        return BaseQuerySet(self.model, using=self._db).filter(is_deleted=True)


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Criado em"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modificado em"
    )
    is_deleted = models.BooleanField(
        default=False,
        verbose_name="Foi deletado?"
    )
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Deletado em"
    )
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deleted_%(class)s_set",
        verbose_name="Deletado por"
    )

    objects = BaseManager()

    class Meta:
        abstract = True

    def soft_delete(self, user=None):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.deleted_by = user
        self.save()

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save()

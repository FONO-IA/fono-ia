from django.db import models
from uuid import uuid4


# Create your models here.
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
        default=True,
        verbose_name="Foi deletado?"
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.__class__.__name__} - {self.id}"

    def soft_delete(self):
        """Soft delete instead of actual deletion"""
        self.is_deleted = False
        self.save()

    def restore(self):
        """Restore a soft deleted instance"""
        self.is_deleted = True
        self.save()

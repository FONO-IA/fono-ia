from rest_framework.routers import DefaultRouter
from apps.core.api.v1.viewsets import ExercicioViewSet


router = DefaultRouter()

router.register(
    r'exercicios', ExercicioViewSet, basename='exercicio'
)

urlpatterns = router.urls

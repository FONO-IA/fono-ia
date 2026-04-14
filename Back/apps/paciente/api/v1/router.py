from rest_framework.routers import DefaultRouter
from apps.paciente.api.v1.viewsets import PacienteViewSet


router = DefaultRouter()

router.register(
    r'pacientes', PacienteViewSet, basename='paciente'
)

urlpatterns = router.urls

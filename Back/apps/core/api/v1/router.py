from rest_framework.routers import DefaultRouter
from apps.core.api.v1.viewsets import (
    FonoaudiologoViewSet,
    ResponsavelViewSet,
    PacienteViewSet
)

router = DefaultRouter()
router.register(
    r'fonoaudiologos', FonoaudiologoViewSet, basename='fonoaudiologo'
)
router.register(
    r'responsaveis', ResponsavelViewSet, basename='responsavel'
)
router.register(
    r'pacientes', PacienteViewSet, basename='paciente'
)

urlpatterns = router.urls

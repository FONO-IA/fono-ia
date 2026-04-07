from rest_framework.routers import DefaultRouter
from apps.core.api.v1.viewsets import (
    FonoaudiologoViewSet,
    ResponsavelViewSet,
    PacienteViewSet,
    ExercicioViewSet,
    ResultadoViewSet
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
router.register(
    r'exercicios', ExercicioViewSet, basename='exercicio'
)
router.register(
    r'resultados', ResultadoViewSet, basename='resultado'
)

urlpatterns = router.urls

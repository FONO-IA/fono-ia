from rest_framework.routers import DefaultRouter
from apps.resultado.api.v1.viewsets import ResultadoViewSet


router = DefaultRouter()

router.register(
    r'resultados', ResultadoViewSet, basename='resultado'
)

urlpatterns = router.urls

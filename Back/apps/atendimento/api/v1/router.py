from rest_framework.routers import DefaultRouter
from apps.atendimento.api.v1.viewsets import AtendimentoViewSet


router = DefaultRouter()

router.register(
    r'atendimentos', AtendimentoViewSet, basename='atendimento'
)

urlpatterns = router.urls

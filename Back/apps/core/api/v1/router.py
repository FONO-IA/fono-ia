from rest_framework.routers import DefaultRouter
from apps.core.api.v1.viewsets import FonoaudiologoViewSet, ResponsavelViewSet

router = DefaultRouter()
router.register(
    r'fonoaudiologos', FonoaudiologoViewSet, basename='fonoaudiologo'
)
router.register(
    r'responsaveis', ResponsavelViewSet, basename='responsavel'
)

urlpatterns = router.urls

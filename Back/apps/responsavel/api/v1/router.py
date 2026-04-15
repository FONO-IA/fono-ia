from rest_framework.routers import DefaultRouter
from apps.responsavel.api.v1.viewsets import ResponsavelViewSet

router = DefaultRouter()

router.register(
    r'responsaveis', ResponsavelViewSet, basename='responsavel'
)

urlpatterns = router.urls

from rest_framework.routers import DefaultRouter
from apps.core.api.v1.viewsets import ResponsavelViewSet

router = DefaultRouter()

router.register(
    r'responsavel', ResponsavelViewSet, basename='responsavel'
)

urlpatterns = router.urls

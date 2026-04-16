from rest_framework.routers import DefaultRouter
from apps.fonoaudiologo.api.v1.viewsets import FonoaudiologoViewSet


router = DefaultRouter()

router.register(
    r'fonoaudiologos', FonoaudiologoViewSet, basename='fonoaudiologo'
)

urlpatterns = router.urls

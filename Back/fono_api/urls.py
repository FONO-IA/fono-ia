from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


schema_view = get_schema_view(
    openapi.Info(
        title="FONO-IA API",
        default_version='v1',
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # ========================================================================
    # Auth
    path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),
    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),
    # ========================================================================
    # ========================================================================
    # Admin e APIs
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.atendimento.api.v1.router')),
    path('api/v1/', include('apps.exercicio.api.v1.router')),
    path('api/v1/', include('apps.fonoaudiologo.api.v1.router')),
    path('api/v1/', include('apps.paciente.api.v1.router')),
    path('api/v1/', include('apps.responsavel.api.v1.router')),
    path('api/v1/', include('apps.resultado.api.v1.router')),
    # ========================================================================
    # ========================================================================
    # Documentação

    path('docs/', schema_view.with_ui(
        'swagger',
        cache_timeout=0
        ),
        name='schema-swagger-ui'
    ),
    path('redoc/', schema_view.with_ui(
        'redoc',
        cache_timeout=0
        ),
        name='schema-redoc'
    ),

    path('swagger/', RedirectView.as_view(url='/docs/', permanent=True)),
    path('doc/', RedirectView.as_view(url='/docs/', permanent=True)),
    path('documentation/', RedirectView.as_view(url='/docs/', permanent=True)),
    path('api-docs/', RedirectView.as_view(url='/docs/', permanent=True)),
    path('redocs/', RedirectView.as_view(url='/redoc/', permanent=True)),
    path('api-redoc/', RedirectView.as_view(url='/redoc/', permanent=True)),
    # ========================================================================
]

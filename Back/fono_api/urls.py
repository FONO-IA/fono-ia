from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="FONO-IA API",
        default_version='v1',
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.atendimento.api.v1.router')),

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
]

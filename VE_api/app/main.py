"""
FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.api import router

# Cria aplicação FastAPI
app = FastAPI(
    title="API de Análise Fonética",
    description="""
    ## API para Análise Comparativa de Pronúncia

    Esta API implementa um sistema robusto de análise fonética que compara 
    a pronúncia de um paciente com um áudio de referência.

    ### Funcionalidades:

    - **Análise Fonética**: MFCC, Formantes (F1, F2, F3), VTLN
    - **Análise Prosódica**: Pitch (entonação), Ritmo, Energia (sílaba tônica)
    - **Diagnóstico Automático**: Alertas para omissão, articulação fraca e tonicidade
    - **Scores Detalhados**: Score final, fonético e prosódico

    ### Como usar:

    1. Faça upload de dois arquivos de áudio (referência e teste)
    2. A API processa e retorna uma análise completa
    3. Consulte os alertas diagnósticos para insights clínicos

    ### Formatos suportados:
    WAV, MP3, M4A, OGG
    """,
    version="5.0.0",
    contact={
        "name": "Suporte Técnico",
        "email": "suporte@analisefonetica.com"
    },
    license_info={
        "name": "MIT",
    }
)

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://fono-ia.vercel.app',
        'http://localhost:5173',
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui rotas
app.include_router(router)


@app.get("/", tags=["root"])
async def root():
    """Endpoint raiz com informações da API"""
    return {
        "message": "API de Análise Fonética",
        "version": "5.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "health": "/api/v1/health",
            "analyze": "/api/v1/analyze (POST)",
            "analyze_files": "/api/v1/analyze/files (POST)"
        }
    }


def custom_openapi():
    """Customiza documentação OpenAPI"""
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Adiciona tags personalizadas
    openapi_schema["tags"] = [
        {"name": "phonetic-analysis",
         "description": "Operações de análise fonética"},
        {"name": "health", "description": "Verificação de saúde da API"},
        {"name": "root", "description": "Endpoint raiz"}
    ]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

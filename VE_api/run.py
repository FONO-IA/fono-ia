#!/usr/bin/env python
"""
Script para executar a API de Análise Fonética
"""

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("🎤 API de Análise Fonética - Versão 5.0")
    print("=" * 60)
    print("\nServidor iniciando...")
    print("\n📚 Documentação disponível em:")
    print("   - Swagger UI: http://localhost:8050/docs")
    print("   - ReDoc: http://localhost:8050/redoc")
    print("\n🔊 Endpoints disponíveis:")
    print("   - GET  /api/v1/health - Health check")
    print("   - POST /api/v1/analyze - Análise por upload de arquivos")
    print("   - POST /api/v1/analyze/files - Análise por caminho (teste local)")
    print("\n" + "=" * 60)
    print("\n✨ Servidor pronto para receber requisições!\n")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )

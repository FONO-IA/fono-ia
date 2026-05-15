"""
API routes for phonetic analysis endpoints
"""

import os
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.api.models import AnalysisResponse, HealthResponse
from app.services import AnalysisService, AudioService

router = APIRouter(prefix="/api/v1", tags=["phonetic-analysis"])

# Serviços (singleton)
_audio_service = None
_analysis_service = None


def get_audio_service():
    """Dependency injection for audio service"""
    global _audio_service
    if _audio_service is None:
        _audio_service = AudioService(sample_rate=22050)
    return _audio_service


def get_analysis_service():
    """Dependency injection for analysis service"""
    global _analysis_service
    if _analysis_service is None:
        _analysis_service = AnalysisService(sample_rate=22050)
    return _analysis_service


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Verifica o status da API"""
    return HealthResponse(
        status="healthy",
        version="5.0.0",
        timestamp=datetime.now()
    )


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analisa pronúncia",
    description="Compara dois arquivos de áudio (referência e teste) e retorna"
                " uma análise detalhada da pronúncia"
)
async def analyze_pronunciation(
    reference_audio: UploadFile = File(
        ..., description="Áudio de referência (modelo correto)"
    ),
    test_audio: UploadFile = File(
        ..., description="Áudio do paciente para análise"
    ),
    audio_service: AudioService = Depends(get_audio_service),
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Endpoint para análise comparativa de pronúncia.

    Args:
        reference_audio: Arquivo WAV de referência (boa pronúncia)
        test_audio: Arquivo WAV do paciente a ser analisado

    Returns:
        AnalysisResponse: Scores detalhados, métricas e alertas diagnósticos
    """
    # Valida tipos de arquivo
    allowed_extensions = {'.wav', '.mp3', '.m4a', '.ogg'}

    ref_ext = _get_file_extension(reference_audio.filename)
    test_ext = _get_file_extension(test_audio.filename)

    if ref_ext.lower() not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado para áudio de referência: {ref_ext}"
                   f". Use WAV, MP3, M4A ou OGG"
        )

    if test_ext.lower() not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado para áudio de teste: {test_ext}. "
                   f"Use WAV, MP3, M4A ou OGG"
        )

    try:
        # Lê bytes dos arquivos
        reference_bytes = await reference_audio.read()
        test_bytes = await test_audio.read()

        if len(reference_bytes) == 0:
            raise HTTPException(
                status_code=400, detail="Áudio de referência vazio"
            )

        if len(test_bytes) == 0:
            raise HTTPException(
                status_code=400, detail="Áudio de teste vazio"
            )

        # Carrega áudios
        reference_signal, ref_sr = audio_service.load_audio_from_bytes(
            reference_bytes
        )
        test_signal, test_sr = audio_service.load_audio_from_bytes(test_bytes)

        # Verifica se os áudios têm conteúdo após VAD
        ref_voice, ref_duration = audio_service.remove_silence(
            reference_signal, ref_sr
        )
        test_voice, test_duration = audio_service.remove_silence(
            test_signal, test_sr
        )

        if len(ref_voice) < ref_sr * 0.1:  # menos de 100ms de voz
            raise HTTPException(
                status_code=400,
                detail="Áudio de referência não contém voz detectável após "
                       "remoção de silêncio"
            )

        if len(test_voice) < test_sr * 0.1:
            raise HTTPException(
                status_code=400,
                detail="Áudio de teste não contém voz detectável após "
                       "remoção de silêncio"
            )

        # Realiza análise
        result = analysis_service.analyze_pronunciation(
            reference_signal,
            test_signal,
            reference_filename=reference_audio.filename,
            test_filename=test_audio.filename
        )

        return JSONResponse(content=result, status_code=200)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro interno: {str(e)}"
        )


@router.post(
    "/analyze/files",
    response_model=AnalysisResponse,
    summary="Analisa pronúncia por caminhos de arquivo",
    description="Compara dois arquivos de áudio fornecendo caminhos "
                "(para teste local)"
)
async def analyze_by_paths(
    reference_path: str,
    test_path: str,
    audio_service: AudioService = Depends(get_audio_service),
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Endpoint para análise usando caminhos de arquivo (útil para testes locais).

    Args:
        reference_path: Caminho para o arquivo de referência
        test_path: Caminho para o arquivo de teste

    Returns:
        AnalysisResponse: Scores detalhados, métricas e alertas diagnósticos
    """
    if not os.path.exists(reference_path):
        raise HTTPException(
            status_code=404,
            detail=f"Arquivo de referência não encontrado: {reference_path}"
        )

    if not os.path.exists(test_path):
        raise HTTPException(
            status_code=404,
            detail=f"Arquivo de teste não encontrado: {test_path}"
        )

    try:
        reference_signal, ref_sr = audio_service.load_audio(reference_path)
        test_signal, test_sr = audio_service.load_audio(test_path)

        result = analysis_service.analyze_pronunciation(
            reference_signal,
            test_signal,
            reference_filename=os.path.basename(reference_path),
            test_filename=os.path.basename(test_path)
        )

        return JSONResponse(content=result, status_code=200)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro interno: {str(e)}"
        )


def _get_file_extension(filename: str) -> str:
    """Retorna a extensão de um arquivo"""
    return '.' + filename.split('.')[-1] if '.' in filename else ''

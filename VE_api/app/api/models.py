"""
Pydantic models for API requests and responses
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class AnalysisResponse(BaseModel):
    """Modelo de resposta da análise"""
    analysis_metadata: Dict[str, Any]
    final_score: float
    quality_classification: str
    phonetic_analysis: Dict[str, Any]
    prosody_analysis: Dict[str, Any]
    duration_analysis: Dict[str, Any]
    diagnostic_alerts: List[Dict[str, Any]]


class HealthResponse(BaseModel):
    """Modelo de resposta do health check"""
    status: str
    version: str
    timestamp: datetime


class ErrorResponse(BaseModel):
    """Modelo de resposta de erro"""
    error: str
    detail: str
    timestamp: datetime

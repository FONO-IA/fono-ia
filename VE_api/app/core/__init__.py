"""
Módulo core com classes principais do analisador fonético
"""

from app.core.analyzer import PhoneticAnalyzer
from app.core.alert_generator import AlertGenerator
from app.core.comparators import FeatureComparators
from app.core.feature_extractor import FeatureExtractor

__all__ = [
    'PhoneticAnalyzer',
    'AlertGenerator',
    'FeatureComparators',
    'FeatureExtractor'
]
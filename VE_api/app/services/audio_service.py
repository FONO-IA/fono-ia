"""
Audio processing service
"""

import os
from tempfile import NamedTemporaryFile

import librosa

from app.core import PhoneticAnalyzer


class AudioService:
    """Serviço para processamento de áudio"""

    def __init__(self, sample_rate=22050):
        """
        Inicializa o serviço de áudio.

        Args:
            sample_rate: Taxa de amostragem para processamento
        """
        self.sample_rate = sample_rate
        self.analyzer = PhoneticAnalyzer(sample_rate=sample_rate)

    def load_audio(self, audio_path):
        """
        Carrega áudio do caminho especificado.

        Args:
            audio_path: Caminho para o arquivo de áudio

        Returns:
            tuple: (sinal_audio, taxa_amostragem)
        """
        audio_signal, sample_rate = librosa.load(
            audio_path, sr=self.sample_rate, mono=True
        )
        return audio_signal, sample_rate

    def load_audio_from_bytes(self, audio_bytes):
        """
        Carrega áudio a partir de bytes.

        Args:
            audio_bytes: Bytes do arquivo de áudio

        Returns:
            tuple: (sinal_audio, taxa_amostragem)
        """
        with NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        try:
            audio_signal, sample_rate = self.load_audio(temp_path)
            return audio_signal, sample_rate
        finally:
            os.unlink(temp_path)

    def remove_silence(self, audio_signal, sample_rate):
        """
        Remove silêncios do áudio.

        Args:
            audio_signal: Sinal de áudio
            sample_rate: Taxa de amostragem

        Returns:
            tuple: (audio_sem_silencio, duracao)
        """
        voice_only, duration = self.analyzer.detect_voice_activity(
            audio_signal, sample_rate
        )
        return voice_only, duration

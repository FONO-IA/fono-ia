"""
Analisador fonético principal
"""

import warnings

import librosa
import numpy as np

warnings.filterwarnings('ignore')


class PhoneticAnalyzer:
    """
    Analisador fonético ROBUSTO - VERSÃO 5.0

    Características:
    - VTLN Piecewise
    - Análise de Pitch (F0) normalizado
    - Penalidade por estiramento temporal
    - Envelope de energia para sílaba tônica
    - Score separado: Fonético + Entonação/Ritmo
    - SISTEMA DE ALERTAS DIAGNÓSTICOS REFINADO
    """

    def __init__(self, sample_rate=22050):
        """
        Inicializa o analisador fonético.

        Args:
            sample_rate: Taxa de amostragem para processamento
        """
        self.sample_rate = sample_rate
        self.quantity_mfcc_coefficients = 13
        self.quantity_mel_bands = 64
        self.feature_extractor = None
        self.comparators = None
        self.alert_generator = None

    def set_dependencies(
        self,
        feature_extractor,
        comparators,
        alert_generator
    ):
        """
        Injeta as dependências do analisador.

        Args:
            feature_extractor: Extrator de features
            comparators: Comparadores de features
            alert_generator: Gerador de alertas
        """
        self.feature_extractor = feature_extractor
        self.comparators = comparators
        self.alert_generator = alert_generator

    def detect_voice_activity(
        self,
        audio_signal,
        sample_rate,
        silence_threshold_db=25,
        frame_length_samples=2048,
        hop_length_samples=512
    ):
        """
        Detecta segmentos de voz no áudio e retorna apenas a parte vocalizada.

        Remove silêncios e ruídos de fundo usando RMS e Zero Crossing Rate.

        Args:
            audio_signal: Sinal de áudio
            sample_rate: Taxa de amostragem
            silence_threshold_db: Limiar de silêncio em dB
            frame_length_samples: Tamanho do frame em amostras
            hop_length_samples: Deslocamento entre frames

        Returns:
            tuple: (áudio recortado, duração em segundos)
        """
        # Calcula energia RMS em dB para cada frame
        energy_rms = librosa.feature.rms(
            y=audio_signal,
            frame_length=frame_length_samples,
            hop_length=hop_length_samples
        )[0]
        energy_rms_db = librosa.amplitude_to_db(energy_rms, ref=np.max)

        # Calcula taxa de cruzamento por zero
        zcr = librosa.feature.zero_crossing_rate(
            audio_signal,
            frame_length=frame_length_samples,
            hop_length=hop_length_samples
        )[0]

        # Define thresholds para classificação
        energy_threshold = np.max(energy_rms_db) - silence_threshold_db
        zcr_low = 0.05   # Abaixo disso é silêncio
        zcr_high = 0.5   # Acima disso é ruído

        # Classifica frames que contém voz
        voiced_mask = (
            (energy_rms_db > energy_threshold)
            & (zcr > zcr_low)
            & (zcr < zcr_high)
        )

        frames_with_voice = np.where(voiced_mask)[0]

        # Se nenhum frame com voz for detectado
        if len(frames_with_voice) == 0:
            audio_trimmed = librosa.effects.trim(
                audio_signal, top_db=silence_threshold_db
            )[0]
            duration = len(audio_trimmed) / sample_rate
            return audio_trimmed, duration

        # Determina início e fim da região com voz
        first_frame = frames_with_voice[0]
        last_frame = frames_with_voice[-1]

        # Converte índices de frames para amostras
        start_sample = first_frame * hop_length_samples
        end_sample = min(
            last_frame * hop_length_samples + frame_length_samples,
            len(audio_signal)
        )

        # Adiciona margem de segurança de 50ms nas bordas
        margin = int(0.05 * sample_rate)
        start_sample = max(0, start_sample - margin)
        end_sample = min(len(audio_signal), end_sample + margin)

        audio_voice = audio_signal[start_sample:end_sample]
        duration = len(audio_voice) / sample_rate

        return audio_voice, duration

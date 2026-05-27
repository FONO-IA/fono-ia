"""
Main analysis service
"""

from app.core import (
    AlertGenerator,
    FeatureComparators,
    FeatureExtractor,
    PhoneticAnalyzer,
)


class AnalysisService:
    """Serviço principal de análise fonética."""

    # ---------------------------------------------------------------
    # Penalidades de duração
    # ---------------------------------------------------------------
    DURATION_RATIO_EXTREME_LOW = 0.5
    DURATION_RATIO_EXTREME_HIGH = 2.0
    DURATION_RATIO_HIGH_LOW = 0.7
    DURATION_RATIO_HIGH_HIGH = 1.6
    DURATION_RATIO_MODERATE_LOW = 0.8
    DURATION_RATIO_MODERATE_HIGH = 1.3

    DURATION_PENALTY_EXTREME = 0.4
    DURATION_PENALTY_HIGH = 0.6
    DURATION_PENALTY_MODERATE = 0.8
    DURATION_PENALTY_NONE = 1.0

    # ---------------------------------------------------------------
    # Limiares de classificação
    # ---------------------------------------------------------------
    QUALITY_EXCELENTE_THRESHOLD = 75
    QUALITY_MUITO_BOA_THRESHOLD = 60
    QUALITY_BOA_THRESHOLD = 45
    QUALITY_REGULAR_THRESHOLD = 30

    # ---------------------------------------------------------------
    # Pesos dos scores parciais
    # ---------------------------------------------------------------
    PHONETIC_WEIGHT = 0.6          # peso do score fonético no final
    PROSODY_WEIGHT = 0.4           # peso do score prosódico no final

    # Pesos internos da prosódia
    PITCH_WEIGHT_IN_PROSODY = 0.4
    RHYTHM_WEIGHT_IN_PROSODY = 0.25
    ENERGY_WEIGHT_IN_PROSODY = 0.35

    def __init__(self, sample_rate=22050):
        """
        Inicializa o serviço de análise.

        Args:
            sample_rate: Taxa de amostragem para processamento.
        """
        self.sample_rate = sample_rate
        self.analyzer = PhoneticAnalyzer(sample_rate=sample_rate)
        self.feature_extractor = FeatureExtractor(sample_rate=sample_rate)
        self.comparators = FeatureComparators()
        self.alert_generator = AlertGenerator()

        # Injeta dependências
        self.analyzer.set_dependencies(
            feature_extractor=self.feature_extractor,
            comparators=self.comparators,
            alert_generator=self.alert_generator,
        )

    def analyze_pronunciation(
        self,
        ref_signal,
        test_signal,
        reference_filename=None,
        test_filename=None,
    ):
        """
        Realiza análise completa de pronúncia.

        Args:
            ref_signal: Sinal de áudio de referência.
            test_signal: Sinal de áudio de teste.
            reference_filename: Nome do arquivo de referência.
            test_filename: Nome do arquivo de teste.

        Returns:
            dict: Resultado completo da análise.
        """
        sr = self.sample_rate

        # PASSO 1: Remove silêncios
        ref_voice, ref_dur = self.analyzer.detect_voice_activity(
            ref_signal, sr
        )
        test_voice, test_dur = self.analyzer.detect_voice_activity(
            test_signal, sr
        )

        # PASSO 2: Extrai MFCC
        mfcc_ref, _, _, _ = self.feature_extractor.extract_mfcc_features(
            ref_voice, sr
        )
        mfcc_test, _, _, _ = self.feature_extractor.extract_mfcc_features(
            test_voice, sr
        )

        # DTW com penalidade de ritmo
        (
            mfcc_dist,
            _,
            _,
            _,
            rhythm_score,
            rhythm_dev,
        ) = self.comparators.compute_rhythm_penalty(mfcc_ref, mfcc_test)

        # PASSO 3: Extrai Formantes
        formants_ref, _ = self.feature_extractor.extract_formants_robust(
            ref_voice, sr
        )
        formants_test, _ = self.feature_extractor.extract_formants_robust(
            test_voice, sr
        )

        formant_comp = self.comparators.compare_formant_statistics(
            formants_ref, formants_test, self.feature_extractor
        )

        # Score fonético
        phonetic_score, mfcc_score, formant_score = (
            self.comparators.calculate_phonetic_score(mfcc_dist, formant_comp)
        )

        # PASSO 4: Análise de Pitch
        pitch_ref, _, _, _ = self.feature_extractor.extract_normalized_pitch(
            ref_voice, sr
        )
        pitch_test, _, _, _ = self.feature_extractor.extract_normalized_pitch(
            test_voice, sr
        )
        pitch_comp = self.comparators.compare_pitch_patterns(
            pitch_ref, pitch_test
        )

        # PASSO 5: Análise de Energia
        energy_ref, ref_peaks, _ = (
            self.feature_extractor.extract_energy_envelope(ref_voice, sr)
        )
        energy_test, test_peaks, _ = (
            self.feature_extractor.extract_energy_envelope(test_voice, sr)
        )
        energy_comp = self.comparators.compare_energy_patterns(
            energy_ref, energy_test, ref_peaks, test_peaks
        )

        # Score prosódico
        prosody_score = (
            self.PITCH_WEIGHT_IN_PROSODY * pitch_comp['pitch_score']
            + self.RHYTHM_WEIGHT_IN_PROSODY * rhythm_score
            + self.ENERGY_WEIGHT_IN_PROSODY * energy_comp['energy_score']
        )

        # Score final
        final_score = (
            self.PHONETIC_WEIGHT * phonetic_score
            + self.PROSODY_WEIGHT * prosody_score
        )

        # Penalidade gradual por diferença de duração
        dur_ratio = test_dur / ref_dur if ref_dur > 0 else 999
        if (
            dur_ratio < self.DURATION_RATIO_EXTREME_LOW
            or dur_ratio > self.DURATION_RATIO_EXTREME_HIGH
        ):
            duration_penalty = self.DURATION_PENALTY_EXTREME
        elif (
            dur_ratio < self.DURATION_RATIO_HIGH_LOW
            or dur_ratio > self.DURATION_RATIO_HIGH_HIGH
        ):
            duration_penalty = self.DURATION_PENALTY_HIGH
        elif (
            dur_ratio < self.DURATION_RATIO_MODERATE_LOW
            or dur_ratio > self.DURATION_RATIO_MODERATE_HIGH
        ):
            duration_penalty = self.DURATION_PENALTY_MODERATE
        else:
            duration_penalty = self.DURATION_PENALTY_NONE

        final_score *= duration_penalty

        # Classificação
        if final_score >= self.QUALITY_EXCELENTE_THRESHOLD:
            quality = "Excelente"
        elif final_score >= self.QUALITY_MUITO_BOA_THRESHOLD:
            quality = "Muito Boa"
        elif final_score >= self.QUALITY_BOA_THRESHOLD:
            quality = "Boa"
        elif final_score >= self.QUALITY_REGULAR_THRESHOLD:
            quality = "Regular"
        else:
            quality = "Diferente"

        # Métricas para alertas
        metrics = {
            'final_score': final_score,
            'phonetic_score': phonetic_score,
            'prosody_score': prosody_score,
            'quality': quality,
            'mfcc_score': mfcc_score,
            'formant_score': formant_score,
            'pitch_score': pitch_comp['pitch_score'],
            'pitch_correlation': pitch_comp['correlation'],
            'rhythm_score': rhythm_score,
            'rhythm_deviation': rhythm_dev,
            'energy_score': energy_comp['energy_score'],
            'tonic_match': energy_comp['tonic_match'],
            'formant_stats': formant_comp,
            'duration_ref': ref_dur,
            'duration_test': test_dur,
            'dtw_distance': mfcc_dist,
        }

        alerts = self.alert_generator.generate_diagnostic_alerts(metrics)

        # Monta resultado
        formant_details = {
            name: {
                'similarity_percent': round(stats['similarity'], 1),
                'distance_hz': round(stats['distance'], 1),
                'mean_reference_hz': round(stats['mean_ref'], 1),
                'mean_test_hz': round(stats['mean_test'], 1),
                'has_overlap': stats['has_overlap'],
            }
            for name, stats in formant_comp.items()
        }

        tonic_ref_pos = (
            round(energy_comp['peak_ref_pos'], 3)
            if energy_comp['peak_ref_pos']
            else None
        )
        tonic_test_pos = (
            round(energy_comp['peak_test_pos'], 3)
            if energy_comp['peak_test_pos']
            else None
        )

        result = {
            'analysis_metadata': {
                'version': '5.0',
                'sample_rate_hz': sr,
                'reference_file': reference_filename or 'uploaded_reference',
                'test_file': test_filename or 'uploaded_test',
            },
            'final_score': round(final_score, 1),
            'quality_classification': quality,
            'phonetic_analysis': {
                'phonetic_score': round(phonetic_score, 1),
                'mfcc_score': round(mfcc_score, 1),
                'formant_score': round(formant_score, 1),
                'dtw_distance': round(mfcc_dist, 4),
                'formant_details': formant_details,
            },
            'prosody_analysis': {
                'prosody_score': round(prosody_score, 1),
                'pitch_score': round(pitch_comp['pitch_score'], 1),
                'pitch_correlation': round(pitch_comp['correlation'], 4),
                'pitch_average_reference_hz': round(
                    pitch_comp['f0_mean_ref'], 1
                ),
                'pitch_average_test_hz': round(pitch_comp['f0_mean_test'], 1),
                'rhythm_score': round(rhythm_score, 1),
                'rhythm_deviation': round(rhythm_dev, 4),
                'energy_score': round(energy_comp['energy_score'], 1),
                'tonic_syllable_match': energy_comp['tonic_match'],
                'tonic_position_reference': tonic_ref_pos,
                'tonic_position_test': tonic_test_pos,
            },
            'duration_analysis': {
                'reference_duration_seconds': round(ref_dur, 2),
                'test_duration_seconds': round(test_dur, 2),
                'duration_ratio': round(test_dur / ref_dur, 2)
                if ref_dur > 0
                else 0,
            },
            'diagnostic_alerts': alerts,
        }

        return result

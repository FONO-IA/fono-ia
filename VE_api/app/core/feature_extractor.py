"""
Extrator de features de áudio
"""

import warnings

import librosa
import numpy as np
from scipy.interpolate import interp1d
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

warnings.filterwarnings('ignore')


class FeatureExtractor:
    """Responsável pela extração de features dos áudios"""

    def __init__(self, sample_rate=22050):
        """
        Inicializa o extrator de features.

        Args:
            sample_rate: Taxa de amostragem para processamento
        """
        self.sample_rate = sample_rate
        self.quantity_mel_bands = 64

    def extract_normalized_pitch(self, audio_signal, sample_rate):
        """
        Extrai e normaliza a frequência fundamental (F0/pitch) do áudio.

        A normalização remove diferenças de altura da voz entre falantes
        (voz grave vs aguda) mantendo apenas o contorno melódico.

        Args:
            audio_signal: Sinal de áudio
            sample_rate: Taxa de amostragem

        Returns:
            tuple: (pitch_suavizado, pitch_normalizado, is_voiced, average)
        """
        # Extrai F0 usando algoritmo PYIN
        f0, voiced, _ = librosa.pyin(
            audio_signal,
            fmin=librosa.note_to_hz('C2'),  # ~65 Hz
            fmax=librosa.note_to_hz('C6'),  # ~1047 Hz
            sr=sample_rate
        )

        # Fallback para YIN caso PYIN falhe
        if f0 is None or np.all(np.isnan(f0)):
            f0 = librosa.yin(
                audio_signal, fmin=65, fmax=1047, sr=sample_rate
            )
            voiced = ~np.isnan(f0)

        # Substitui NaN por zero para processamento
        pitch_zeros = np.nan_to_num(f0, nan=0.0)

        # Calcula estatísticas apenas nos segmentos com voz
        if np.any(voiced):
            pitch_voiced = f0[voiced]
        else:
            pitch_voiced = pitch_zeros[pitch_zeros > 0]

        if len(pitch_voiced) > 0:
            pitch_mean = np.mean(pitch_voiced)
            pitch_std = np.std(pitch_voiced)
            # Z-score: remove média e normaliza variação
            pitch_norm = np.where(
                pitch_zeros > 0,
                (pitch_zeros - pitch_mean) / (pitch_std + 1e-10),
                0.0
            )
        else:
            pitch_mean = 0
            pitch_norm = np.zeros_like(pitch_zeros)

        # Suaviza o contorno para reduzir micro-variações
        pitch_smooth = gaussian_filter1d(pitch_norm, sigma=2)

        return pitch_smooth, pitch_norm, voiced, pitch_mean

    def extract_energy_envelope(
        self,
        audio_signal,
        sample_rate,
        hop_length=512
    ):
        """
        Extrai o envelope de energia RMS do áudio.

        Identifica a localização da sílaba tônica (pico de energia).

        Args:
            audio_signal: Sinal de áudio
            sample_rate: Taxa de amostragem
            hop_length: Deslocamento entre frames

        Returns:
            tuple: (envelope_normalizado, picos_ordenados, todos_picos)
        """
        # Calcula RMS para cada frame
        energy_rms = librosa.feature.rms(
            y=audio_signal, hop_length=hop_length
        )[0]

        # Suaviza com filtro gaussiano
        energy_smooth = gaussian_filter1d(energy_rms, sigma=3)

        # Normaliza entre 0 e 1
        energy_min = np.min(energy_smooth)
        energy_max = np.max(energy_smooth)
        if energy_max - energy_min > 1e-10:
            energy_norm = (energy_smooth - energy_min) / (
                energy_max - energy_min
            )
        else:
            energy_norm = np.zeros_like(energy_smooth)

        # Encontra picos proeminentes
        peaks, properties = find_peaks(
            energy_norm, prominence=0.1, distance=10
        )

        # Ordena picos por proeminência
        if len(peaks) > 0:
            if 'prominences' in properties and (
                len(properties['prominences']) > 0
            ):
                sorted_idx = np.argsort(properties['prominences'])[::-1]
                peaks_sorted = peaks[sorted_idx]
            else:
                peaks_sorted = peaks
        else:
            peaks_sorted = np.array([])

        return energy_norm, peaks_sorted, peaks

    def extract_formants_robust(
        self,
        audio_signal,
        sample_rate,
        num_formants=3,
        lpc_order_range=(10, 16)
    ):
        """
        Extração robusta de formantes usando LPC.

        Varre múltiplas ordens de LPC e seleciona a melhor para cada frame.
        Filtra formantes válidos (80-5000 Hz) e interpola valores ausentes.

        Args:
            audio_signal: Sinal de áudio
            sample_rate: Taxa de amostragem
            num_formants: Número de formantes a extrair
            lpc_order_range: Faixa de ordens LPC para testar

        Returns:
            tuple: (matriz_formantes, timestamps)
        """
        frame_len = int(0.025 * sample_rate)  # 25ms
        hop_len = int(0.010 * sample_rate)    # 10ms

        formants_list = []
        timestamps = []

        # Processa cada frame do áudio
        for frame_idx in range(
            0, len(audio_signal) - frame_len, hop_len
        ):
            frame = audio_signal[frame_idx:frame_idx + frame_len]

            # Aplica janela de Hamming
            frame = frame * np.hamming(len(frame))

            # Pré-ênfase para realçar altas frequências
            pre_emp = 0.97
            frame = np.append(
                frame[0],
                frame[1:] - pre_emp * frame[:-1]
            )

            best_formants = None
            best_score = -np.inf

            # Testa diferentes ordens de LPC
            for lpc_order in range(lpc_order_range[0], lpc_order_range[1] + 1):
                try:
                    # Autocorrelação
                    autocorr = np.correlate(frame, frame, mode='full')
                    autocorr = autocorr[len(autocorr) // 2:]

                    if len(autocorr) <= lpc_order:
                        continue

                    # Coeficientes LPC via Levinson-Durbin
                    lpc_coeffs = self._compute_lpc_coefficients(
                        autocorr, lpc_order
                    )

                    # Encontra formantes
                    formants = self._find_formants_from_lpc(
                        lpc_coeffs, sample_rate, num_formants
                    )

                    # Calcula score
                    score = len(formants) * 100
                    if len(formants) > 1:
                        score -= np.std(formants)

                    if score > best_score:
                        best_score = score
                        best_formants = formants
                except Exception:
                    continue

            # Armazena formantes do frame
            if best_formants is not None:
                while len(best_formants) < num_formants:
                    best_formants.append(np.nan)
                formants_list.append(best_formants[:num_formants])
            else:
                formants_list.append([np.nan] * num_formants)

            timestamps.append(frame_idx / sample_rate)

        formants_matrix = np.array(formants_list)
        timestamps_arr = np.array(timestamps)

        # Interpola e suaviza cada formante
        for idx in range(num_formants):
            valid = ~np.isnan(formants_matrix[:, idx])
            if np.sum(valid) > 3:
                interp = interp1d(
                    timestamps_arr[valid],
                    formants_matrix[valid, idx],
                    kind='linear',
                    fill_value='extrapolate'
                )
                formants_matrix[:, idx] = interp(timestamps_arr)

                sigma = 3 if idx == 2 else 1.5
                formants_matrix[:, idx] = gaussian_filter1d(
                    formants_matrix[:, idx], sigma=sigma
                )

        return formants_matrix, timestamps_arr

    def _compute_lpc_coefficients(self, autocorr, order):
        """
        Calcula coeficientes LPC usando algoritmo de Levinson-Durbin.

        Args:
            autocorr: Autocorrelação do sinal
            order: Ordem do filtro LPC

        Returns:
            np.array: Coeficientes LPC
        """
        r = autocorr[:order]
        lpc_coeffs = np.zeros(order)
        lpc_coeffs[0] = 1
        error = r[0]

        for k in range(1, order):
            if error < 1e-10:
                break

            reflection = -np.dot(
                lpc_coeffs[:k][::-1], r[1:k + 1]
            ) / (error + 1e-10)

            lpc_coeffs[1:k + 1] = (
                lpc_coeffs[1:k + 1] + reflection * lpc_coeffs[:k][::-1]
            )
            lpc_coeffs[k] = reflection
            error = error * (1 - reflection ** 2)

        return lpc_coeffs

    def _find_formants_from_lpc(self, lpc_coeffs, sample_rate, num_formants):
        """
        Encontra formantes a partir de coeficientes LPC.

        Args:
            lpc_coeffs: Coeficientes LPC
            sample_rate: Taxa de amostragem
            num_formants: Número de formantes desejados

        Returns:
            list: Frequências dos formantes encontrados
        """
        # Encontra raízes do polinômio LPC
        roots = np.roots(lpc_coeffs)
        roots = roots[np.imag(roots) > 0]

        if len(roots) == 0:
            return []

        angles = np.arctan2(np.imag(roots), np.real(roots))
        formant_freqs = angles * (sample_rate / (2 * np.pi))

        # Filtra formantes válidos
        valid_formants = []
        for freq in formant_freqs:
            if 80 < freq < 5000:
                # Calcula largura de banda
                mask = np.abs(formant_freqs - freq) < 1
                root_radius = np.abs(roots[mask])
                if len(root_radius) > 0:
                    bandwidth = -0.5 * (sample_rate / (2 * np.pi)) * np.log(
                        root_radius[0] + 1e-10
                    )
                    if bandwidth < 500:
                        valid_formants.append(freq)

        return sorted(valid_formants)[:num_formants]

    def extract_mfcc_features(self, audio_input, sample_rate=None):
        """
        Extrai MFCCs robustos com CMS e CVN mais deltas.

        Args:
            audio_input: Array de áudio ou caminho de arquivo
            sample_rate: Taxa de amostragem

        Returns:
            tuple: (mfcc_combinados, mfcc_normalizados, audio_signal, sr)
        """
        # Carrega áudio se for caminho de arquivo
        if isinstance(audio_input, str):
            audio_signal, sample_rate = librosa.load(
                audio_input, sr=self.sample_rate, mono=True
            )
        else:
            audio_signal = audio_input
            sample_rate = sample_rate or self.sample_rate

        # Remove silêncio
        from app.core.analyzer import PhoneticAnalyzer
        temp_analyzer = PhoneticAnalyzer(sample_rate=self.sample_rate)
        audio_signal, _ = temp_analyzer.detect_voice_activity(
            audio_signal, sample_rate
        )

        # Extrai MFCCs
        mfcc_raw = librosa.feature.mfcc(
            y=audio_signal,
            sr=sample_rate,
            n_mfcc=13,
            n_mels=self.quantity_mel_bands,
            hop_length=512,
            n_fft=2048,
            lifter=22
        )

        # Remove coeficiente de energia (C0)
        mfcc_no_energy = mfcc_raw[1:9, :]

        # CMS: subtrai média
        mfcc_cms = mfcc_no_energy - np.mean(
            mfcc_no_energy, axis=1, keepdims=True
        )

        # CVN: divide por desvio padrão
        mfcc_norm = mfcc_cms / (
            np.std(mfcc_cms, axis=1, keepdims=True) + 1e-10
        )

        # Delta coefficients
        mfcc_delta = librosa.feature.delta(mfcc_norm, width=5)

        # Concatena features
        mfcc_combined = np.vstack([mfcc_norm, mfcc_delta])

        return mfcc_combined, mfcc_norm, audio_signal, sample_rate

    def normalize_vocal_tract_piecewise(self, formants_matrix):
        """
        Normalização do trato vocal por partes (VTLN Piecewise).

        Compensa diferenças anatômicas do trato vocal entre falantes
        usando F2 como referência (1500 Hz é valor médio padrão).

        Args:
            formants_matrix: Matriz de valores dos formantes

        Returns:
            np.array: Matriz com formantes normalizados
        """
        if len(formants_matrix) == 0:
            return formants_matrix

        formants_norm = formants_matrix.copy()

        # Usa F2 médio como referência
        avg_f2 = np.nanmean(formants_matrix[:, 1]) if (
            formants_matrix.shape[1] > 1
        ) else np.nan
        REF_F2 = 1500

        if not np.isnan(avg_f2) and avg_f2 > 0:
            scale = REF_F2 / avg_f2
        else:
            scale = 1.0

        # Limita o fator de escala
        scale = np.clip(scale, 0.85, 1.15)

        # Aplica escala diferente para F1
        for idx in range(formants_matrix.shape[1]):
            if idx == 0:  # F1
                f1_factor = 1.0 + (scale - 1.0) * 0.1
                formants_norm[:, idx] = formants_matrix[:, idx] * f1_factor
            else:  # F2, F3
                formants_norm[:, idx] = formants_matrix[:, idx] * scale

        return formants_norm

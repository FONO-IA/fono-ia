import numpy as np
import librosa
import warnings
from scipy.signal import find_peaks, lfilter
from scipy.interpolate import interp1d
from scipy.ndimage import gaussian_filter1d
from scipy.stats import pearsonr
import os
import json

warnings.filterwarnings('ignore')


class PhoneticAnalyzer:
    """
    Analisador fonético ROBUSTO - VERSÃO 5.0
    - VTLN Piecewise
    - Análise de Pitch (F0) normalizado
    - Penalidade por estiramento temporal
    - Envelope de energia para sílaba tônica
    - Score separado: Fonético + Entonação/Ritmo
    - SISTEMA DE ALERTAS DIAGNÓSTICOS REFINADO
    """
    
    def __init__(self, sample_rate=22050):
        self.sample_rate = sample_rate
        self.quantity_mfcc_coefficients = 13
        self.quantity_mel_bands = 64
        
    def detect_voice_activity(self, audio_signal, sample_rate, silence_threshold_db=25, 
                              frame_length_samples=2048, hop_length_samples=512):
        """
        Detecta segmentos de voz no áudio e retorna apenas a parte vocalizada.
        Remove silêncios e ruídos de fundo usando RMS e Zero Crossing Rate.
        Retorna o áudio recortado e sua duração em segundos.
        """
        # Calcula energia RMS em dB para cada frame
        energy_rms = librosa.feature.rms(
            y=audio_signal, frame_length=frame_length_samples, 
            hop_length=hop_length_samples
        )[0]
        energy_rms_decibels = librosa.amplitude_to_db(energy_rms, ref=np.max)
        
        # Calcula taxa de cruzamento por zero para detectar fricativas vs silêncio
        zero_crossing_rate = librosa.feature.zero_crossing_rate(
            audio_signal, frame_length=frame_length_samples, 
            hop_length=hop_length_samples
        )[0]
        
        # Define thresholds para classificação de frames com voz
        energy_threshold = np.max(energy_rms_decibels) - silence_threshold_db
        zcr_low_threshold = 0.05   # Abaixo disso é silêncio
        zcr_high_threshold = 0.5   # Acima disso é ruído
        
        # Classifica frames que contém voz baseado em energia e ZCR
        voiced_frames_mask = (energy_rms_decibels > energy_threshold) & \
                             (zero_crossing_rate > zcr_low_threshold) & \
                             (zero_crossing_rate < zcr_high_threshold)
        
        frames_with_voice = np.where(voiced_frames_mask)[0]
        
        # Se nenhum frame com voz for detectado, usa trim padrão do librosa
        if len(frames_with_voice) == 0:
            audio_without_silence = librosa.effects.trim(
                audio_signal, top_db=silence_threshold_db
            )[0]
            return audio_without_silence, len(audio_without_silence) / sample_rate
        
        # Determina início e fim da região com voz
        first_voice_frame = frames_with_voice[0]
        last_voice_frame = frames_with_voice[-1]
        
        # Converte índices de frames para amostras de áudio
        voice_start_sample = first_voice_frame * hop_length_samples
        voice_end_sample = min(last_voice_frame * hop_length_samples + frame_length_samples, 
                              len(audio_signal))
        
        # Adiciona margem de segurança de 50ms nas bordas
        margin_samples = int(0.05 * sample_rate)
        voice_start_sample = max(0, voice_start_sample - margin_samples)
        voice_end_sample = min(len(audio_signal), voice_end_sample + margin_samples)
        
        audio_only_voice = audio_signal[voice_start_sample:voice_end_sample]
        voiced_duration_seconds = len(audio_only_voice) / sample_rate
        
        return audio_only_voice, voiced_duration_seconds
    
    def extract_normalized_pitch(self, audio_signal, sample_rate):
        """
        Extrai e normaliza a frequência fundamental (F0/pitch) do áudio.
        A normalização remove diferenças de altura da voz entre falantes
        (voz grave vs aguda) mantendo apenas o contorno melódico.
        Retorna o pitch suavizado, normalizado, flags de segmentos vozeados e média do F0.
        """
        # Extrai F0 usando algoritmo PYIN (mais robusto que YIN puro)
        fundamental_frequency, is_voiced_frame, voicing_probability = librosa.pyin(
            audio_signal, 
            fmin=librosa.note_to_hz('C2'),  # ~65 Hz
            fmax=librosa.note_to_hz('C6'),  # ~1047 Hz
            sr=sample_rate
        )
        
        # Fallback para YIN caso PYIN falhe completamente
        if fundamental_frequency is None or np.all(np.isnan(fundamental_frequency)):
            fundamental_frequency = librosa.yin(
                audio_signal, fmin=65, fmax=1047, sr=sample_rate
            )
            is_voiced_frame = ~np.isnan(fundamental_frequency)
        
        # Substitui NaN por zero para processamento
        pitch_with_zeros = np.nan_to_num(fundamental_frequency, nan=0.0)
        
        # Calcula estatísticas apenas nos segmentos com voz para normalização
        pitch_values_with_voice = fundamental_frequency[is_voiced_frame] if np.any(is_voiced_frame) \
                                  else pitch_with_zeros[pitch_with_zeros > 0]
        
        if len(pitch_values_with_voice) > 0:
            pitch_average = np.mean(pitch_values_with_voice)
            pitch_standard_deviation = np.std(pitch_values_with_voice)
            # Z-score: remove média da altura da voz e normaliza variação
            pitch_normalized = np.where(
                pitch_with_zeros > 0,
                (pitch_with_zeros - pitch_average) / (pitch_standard_deviation + 1e-10),
                0.0
            )
        else:
            pitch_average = 0
            pitch_normalized = np.zeros_like(pitch_with_zeros)
        
        # Suaviza o contorno para reduzir micro-variações
        pitch_normalized_smooth = gaussian_filter1d(pitch_normalized, sigma=2)
        
        return pitch_normalized_smooth, pitch_normalized, is_voiced_frame, pitch_average
    
    def compare_pitch_patterns(self, reference_pitch, test_pitch):
        """
        Compara os contornos de pitch entre referência e teste.
        Utiliza correlação de Pearson e DTW para medir similaridade
        dos padrões de entonação independente da altura absoluta.
        Retorna scores e métricas da comparação.
        """
        # Interpola para mesmo número de pontos temporais normalizados [0,1]
        if len(reference_pitch) != len(test_pitch):
            time_axis_reference = np.linspace(0, 1, len(reference_pitch))
            time_axis_test = np.linspace(0, 1, len(test_pitch))
            target_length = min(len(reference_pitch), len(test_pitch))
            time_axis_interpolated = np.linspace(0, 1, target_length)
            
            reference_pitch_matched = np.interp(
                time_axis_interpolated, time_axis_reference, reference_pitch
            )
            test_pitch_matched = np.interp(
                time_axis_interpolated, time_axis_test, test_pitch
            )
        else:
            reference_pitch_matched = reference_pitch
            test_pitch_matched = test_pitch
        
        # Considera apenas pontos onde ambos os áudios têm voz (F0 > 0)
        both_voiced_mask = (reference_pitch_matched != 0) & (test_pitch_matched != 0)
        
        if np.sum(both_voiced_mask) > 10:
            pearson_correlation, p_value = pearsonr(
                reference_pitch_matched[both_voiced_mask], 
                test_pitch_matched[both_voiced_mask]
            )
            if np.isnan(pearson_correlation):
                pearson_correlation, p_value = 0, 1
        else:
            pearson_correlation, p_value = 0, 1
        
        # Prepara vetores para DTW (apenas segmentos com voz)
        if np.sum(both_voiced_mask) > 10:
            reference_voiced_segments = reference_pitch_matched[both_voiced_mask].reshape(-1, 1)
            test_voiced_segments = test_pitch_matched[both_voiced_mask].reshape(-1, 1)
        else:
            reference_voiced_segments = np.zeros((1, 1))
            test_voiced_segments = np.zeros((1, 1))
        
        # Limita tamanho para performance do DTW
        maximum_samples_for_dtw = 500
        if len(reference_voiced_segments) > maximum_samples_for_dtw:
            indices = np.linspace(0, len(reference_voiced_segments)-1, 
                                 maximum_samples_for_dtw, dtype=int)
            reference_voiced_segments = reference_voiced_segments[indices]
        if len(test_voiced_segments) > maximum_samples_for_dtw:
            indices = np.linspace(0, len(test_voiced_segments)-1, 
                                 maximum_samples_for_dtw, dtype=int)
            test_voiced_segments = test_voiced_segments[indices]
        
        # Calcula distância DTW entre os contornos
        if len(reference_voiced_segments) > 1 and len(test_voiced_segments) > 1:
            dtw_pitch_distance, _, _, _ = self.compute_cosine_dtw(
                reference_voiced_segments, test_voiced_segments,
                window_size=int(min(len(reference_voiced_segments), 
                              len(test_voiced_segments)) * 0.3)
            )
        else:
            dtw_pitch_distance = 1.0
        
        # Converte métricas para scores 0-100
        pitch_correlation_score = max(0, min(100, (pearson_correlation + 1) * 50))
        pitch_dtw_score = max(0, 100 * np.exp(-dtw_pitch_distance / 0.3))
        pitch_final_score = 0.6 * pitch_correlation_score + 0.4 * pitch_dtw_score
        
        # Média do F0 original (antes da normalização) para referência
        average_pitch_reference = np.mean(reference_pitch[reference_pitch > 0]) \
                                  if np.any(reference_pitch > 0) else 0
        average_pitch_test = np.mean(test_pitch[test_pitch > 0]) \
                            if np.any(test_pitch > 0) else 0
        
        return {
            'pitch_score': pitch_final_score,
            'correlation': pearson_correlation,
            'p_value': p_value,
            'dtw_distance': dtw_pitch_distance,
            'f0_mean_ref': average_pitch_reference,
            'f0_mean_test': average_pitch_test
        }
    
    def extract_energy_envelope(self, audio_signal, sample_rate, hop_length_samples=512):
        """
        Extrai o envelope de energia RMS do áudio para identificar
        a localização da sílaba tônica (pico de energia).
        Retorna envelope normalizado e posição dos picos principais.
        """
        # Calcula RMS (Root Mean Square) para cada frame
        energy_rms_frames = librosa.feature.rms(
            y=audio_signal, hop_length=hop_length_samples
        )[0]
        
        # Suaviza com filtro gaussiano para eliminar flutuações rápidas
        energy_rms_smooth = gaussian_filter1d(energy_rms_frames, sigma=3)
        
        # Normaliza entre 0 e 1
        energy_min = np.min(energy_rms_smooth)
        energy_max = np.max(energy_rms_smooth)
        if energy_max - energy_min > 1e-10:
            energy_normalized = (energy_rms_smooth - energy_min) / (energy_max - energy_min)
        else:
            energy_normalized = np.zeros_like(energy_rms_smooth)
        
        # Encontra picos proeminentes (candidatos a sílaba tônica)
        energy_peaks, peak_properties = find_peaks(
            energy_normalized, prominence=0.1, distance=10
        )
        
        # Ordena picos por proeminência (mais proeminente = sílaba tônica)
        if len(energy_peaks) > 0:
            if 'prominences' in peak_properties and len(peak_properties['prominences']) > 0:
                sorted_indices = np.argsort(peak_properties['prominences'])[::-1]
                peaks_sorted_by_prominence = energy_peaks[sorted_indices]
            else:
                peaks_sorted_by_prominence = energy_peaks
        else:
            peaks_sorted_by_prominence = np.array([])
        
        return energy_normalized, peaks_sorted_by_prominence, energy_peaks
    
    def compare_energy_patterns(self, reference_energy_envelope, test_energy_envelope,
                               reference_peaks_sorted, test_peaks_sorted):
        """
        Compara envelopes de energia para verificar se a sílaba tônica
        está na mesma posição relativa entre referência e teste.
        """
        # Interpola para mesmo comprimento normalizado
        if len(reference_energy_envelope) != len(test_energy_envelope):
            time_axis_ref = np.linspace(0, 1, len(reference_energy_envelope))
            time_axis_test = np.linspace(0, 1, len(test_energy_envelope))
            target_len = min(len(reference_energy_envelope), len(test_energy_envelope))
            target_time = np.linspace(0, 1, target_len)
            
            reference_envelope_interpolated = np.interp(
                target_time, time_axis_ref, reference_energy_envelope
            )
            test_envelope_interpolated = np.interp(
                target_time, time_axis_test, test_energy_envelope
            )
        else:
            reference_envelope_interpolated = reference_energy_envelope
            test_envelope_interpolated = test_energy_envelope
        
        # Correlação entre os envelopes
        if len(reference_envelope_interpolated) > 1 and len(test_envelope_interpolated) > 1:
            envelope_correlation, _ = pearsonr(
                reference_envelope_interpolated, test_envelope_interpolated
            )
            if np.isnan(envelope_correlation):
                envelope_correlation = 0
        else:
            envelope_correlation = 0
        
        envelope_score = max(0, min(100, (envelope_correlation + 1) * 50))
        
        # Verifica se o pico principal (tônica) está na mesma posição relativa
        is_tonic_syllable_aligned = False
        tonic_position_reference = None
        tonic_position_test = None
        
        if len(reference_peaks_sorted) > 0 and len(test_peaks_sorted) > 0:
            # Posição normalizada [0,1] do pico mais proeminente
            tonic_position_reference = reference_peaks_sorted[0] / len(reference_energy_envelope) \
                                       if len(reference_energy_envelope) > 0 else 0.5
            tonic_position_test = test_peaks_sorted[0] / len(test_energy_envelope) \
                                 if len(test_energy_envelope) > 0 else 0.5
            # Aceita margem de 20% na posição
            is_tonic_syllable_aligned = abs(tonic_position_reference - tonic_position_test) < 0.2
        
        return {
            'energy_score': envelope_score,
            'correlation': envelope_correlation,
            'tonic_match': bool(is_tonic_syllable_aligned),
            'peak_ref_pos': tonic_position_reference,
            'peak_test_pos': tonic_position_test,
        }
    
    def normalize_vocal_tract_piecewise(self, formant_values_matrix):
        """
        Normalização do trato vocal por partes (VTLN Piecewise).
        Compensa diferenças anatômicas do trato vocal entre falantes
        usando F2 como referência (1500 Hz é valor médio padrão).
        Escala limitada entre 0.85 e 1.15 para evitar distorções extremas.
        """
        if len(formant_values_matrix) == 0:
            return formant_values_matrix
        
        formant_values_normalized = formant_values_matrix.copy()
        
        # Usa F2 médio como referência para escala do trato vocal
        average_formant2 = np.nanmean(formant_values_matrix[:, 1]) \
                          if formant_values_matrix.shape[1] > 1 else np.nan
        reference_formant2 = 1500  # Valor de referência padrão para F2
        
        if not np.isnan(average_formant2) and average_formant2 > 0:
            vocal_tract_scale_factor = reference_formant2 / average_formant2
        else:
            vocal_tract_scale_factor = 1.0
        
        # Limita o fator de escala para evitar normalização excessiva
        vocal_tract_scale_factor = np.clip(vocal_tract_scale_factor, 0.85, 1.15)
        
        # Aplica escala diferente para F1 (muito influenciado pela abertura da mandíbula)
        for formant_index in range(formant_values_matrix.shape[1]):
            if formant_index == 0:  # F1 - pouco afetado pelo comprimento do trato
                formant1_vtln_factor = 1.0 + (vocal_tract_scale_factor - 1.0) * 0.1
                formant_values_normalized[:, formant_index] = \
                    formant_values_matrix[:, formant_index] * formant1_vtln_factor
            else:  # F2, F3 - mais afetados pelo comprimento do trato
                formant_values_normalized[:, formant_index] = \
                    formant_values_matrix[:, formant_index] * vocal_tract_scale_factor
        
        return formant_values_normalized
    
    def extract_formants_robust(self, audio_signal, sample_rate, number_of_formants=3,
                               lpc_order_range=(10, 16)):
        """
        Extração robusta de formantes usando LPC (Linear Predictive Coding).
        Varre múltiplas ordens de LPC e seleciona a melhor para cada frame.
        Filtra formantes válidos (80-5000 Hz) e interpola valores ausentes.
        """
        frame_length_samples = int(0.025 * sample_rate)  # 25ms
        hop_length_samples = int(0.010 * sample_rate)     # 10ms
        
        formants_per_frame = []
        timestamps_formants = []
        
        # Processa cada frame do áudio
        for frame_index in range(0, len(audio_signal) - frame_length_samples, hop_length_samples):
            current_frame = audio_signal[frame_index:frame_index + frame_length_samples]
            # Aplica janela de Hamming e pré-ênfase para realçar altas frequências
            current_frame = current_frame * np.hamming(len(current_frame))
            pre_emphasis_coefficient = 0.97
            current_frame = np.append(
                current_frame[0], 
                current_frame[1:] - pre_emphasis_coefficient * current_frame[:-1]
            )
            
            best_formants_for_frame = None
            best_formant_score = -np.inf
            
            # Testa diferentes ordens de LPC para encontrar a melhor
            for lpc_order_value in range(lpc_order_range[0], lpc_order_range[1] + 1):
                try:
                    # Autocorrelação para estimar filtro LPC
                    autocorrelation = np.correlate(current_frame, current_frame, mode='full')
                    autocorrelation = autocorrelation[len(autocorrelation)//2:]
                    
                    if len(autocorrelation) <= lpc_order_value:
                        continue
                    
                    # Algoritmo de Levinson-Durbin para coeficientes LPC
                    R = autocorrelation[:lpc_order_value]
                    lpc_coefficients = np.zeros(lpc_order_value)
                    lpc_coefficients[0] = 1
                    prediction_error = R[0]
                    
                    for k in range(1, lpc_order_value):
                        if prediction_error < 1e-10:
                            break
                        reflection_coefficient = -np.dot(
                            lpc_coefficients[:k][::-1], R[1:k+1]
                        ) / (prediction_error + 1e-10)
                        lpc_coefficients[1:k+1] = lpc_coefficients[1:k+1] + \
                                                  reflection_coefficient * lpc_coefficients[:k][::-1]
                        lpc_coefficients[k] = reflection_coefficient
                        prediction_error = prediction_error * (1 - reflection_coefficient**2)
                    
                    # Encontra raízes do polinômio LPC (polos = formantes)
                    polynomial_roots = np.roots(lpc_coefficients)
                    # Apenas raízes com parte imaginária positiva (pares conjugados)
                    polynomial_roots = polynomial_roots[np.imag(polynomial_roots) > 0]
                    root_angles = np.arctan2(np.imag(polynomial_roots), np.real(polynomial_roots))
                    formant_frequencies = root_angles * (sample_rate / (2 * np.pi))
                    
                    # Filtra formantes válidos: 80-5000 Hz com banda < 500 Hz
                    valid_formants = []
                    for freq in formant_frequencies:
                        if 80 < freq < 5000:
                            # Calcula largura de banda
                            matching_roots = np.abs(formant_frequencies - freq) < 1
                            if np.sum(matching_roots) > 0:
                                matched_root = polynomial_roots[np.abs(formant_frequencies - freq) < 1]
                                if len(matched_root) > 0:
                                    bandwidth = -0.5 * (sample_rate / (2 * np.pi)) * \
                                               np.log(np.abs(matched_root) + 1e-10)
                                    bandwidth_value = bandwidth[0] if hasattr(bandwidth, '__iter__') else bandwidth
                                    if bandwidth_value < 500:
                                        valid_formants.append(freq)
                    
                    # Ordena e seleciona os N primeiros formantes
                    valid_formants = sorted(valid_formants)[:number_of_formants]
                    # Score: mais formantes encontrados = melhor, menor dispersão = melhor
                    score = len(valid_formants) * 100 - \
                           (np.std(valid_formants) if len(valid_formants) > 1 else 0)
                    
                    if score > best_formant_score:
                        best_formant_score = score
                        best_formants_for_frame = valid_formants
                except:
                    continue
            
            # Armazena formantes do frame (preenche com NaN se necessário)
            if best_formants_for_frame is not None:
                while len(best_formants_for_frame) < number_of_formants:
                    best_formants_for_frame.append(np.nan)
                formants_per_frame.append(best_formants_for_frame[:number_of_formants])
            else:
                formants_per_frame.append([np.nan] * number_of_formants)
            
            timestamps_formants.append(frame_index / sample_rate)
        
        formants_matrix = np.array(formants_per_frame)
        timestamps_array = np.array(timestamps_formants)
        
        # Interpola e suaviza cada formante separadamente
        for formant_idx in range(number_of_formants):
            valid_indices = ~np.isnan(formants_matrix[:, formant_idx])
            if np.sum(valid_indices) > 3:
                # Interpolação linear para preencher gaps
                interpolator = interp1d(
                    timestamps_array[valid_indices],
                    formants_matrix[valid_indices, formant_idx],
                    kind='linear',
                    fill_value='extrapolate'
                )
                formants_matrix[:, formant_idx] = interpolator(timestamps_array)
                # Suavização gaussiana (mais forte em F3 para reduzir ruído)
                smoothing_sigma = 3 if formant_idx == 2 else 1.5
                formants_matrix[:, formant_idx] = gaussian_filter1d(
                    formants_matrix[:, formant_idx], sigma=smoothing_sigma
                )
        
        return formants_matrix, timestamps_array
    
    def extract_mfcc_features(self, audio_input, sample_rate=None):
        """
        Extrai MFCCs robustos com CMS (Cepstral Mean Subtraction) e
        CVN (Cepstral Variance Normalization) mais deltas.
        Aceita caminho de arquivo ou array de áudio.
        """
        # Carrega áudio se for caminho de arquivo
        if isinstance(audio_input, str):
            audio_signal, sample_rate = librosa.load(
                audio_input, sr=self.sample_rate, mono=True
            )
        else:
            audio_signal = audio_input
            sample_rate = sample_rate or self.sample_rate
        
        # Remove silêncio antes de extrair features
        audio_signal, _ = self.detect_voice_activity(audio_signal, sample_rate)
        
        # Extrai 13 MFCCs
        mfcc_coefficients_raw = librosa.feature.mfcc(
            y=audio_signal, sr=sample_rate, n_mfcc=13,
            n_mels=self.quantity_mel_bands, hop_length=512, n_fft=2048,
            lifter=22
        )
        
        # Remove coeficiente de energia (C0) e mantém C1-C8 para foco espectral
        mfcc_without_energy = mfcc_coefficients_raw[1:9, :]
        
        # CMS: subtrai média para remover efeitos de canal/microfone
        mfcc_cepstral_mean_subtracted = mfcc_without_energy - \
                                        np.mean(mfcc_without_energy, axis=1, keepdims=True)
        
        # CVN: divide pelo desvio padrão para normalizar variância
        mfcc_normalized = mfcc_cepstral_mean_subtracted / \
                         (np.std(mfcc_cepstral_mean_subtracted, axis=1, keepdims=True) + 1e-10)
        
        # Delta: primeira derivada temporal (mudanças dinâmicas)
        mfcc_delta_coefficients = librosa.feature.delta(mfcc_normalized, width=5)
        
        # Concatena features estáticas e dinâmicas
        mfcc_combined_features = np.vstack([mfcc_normalized, mfcc_delta_coefficients])
        
        return mfcc_combined_features, mfcc_normalized, audio_signal, sample_rate
    
    def compute_cosine_dtw(self, sequence_x, sequence_y, window_size=None):
        """
        Dynamic Time Warping com distância cosseno.
        Alinha duas sequências temporais encontrando o caminho ótimo
        que minimiza a distância acumulada.
        """
        length_x, length_y = len(sequence_x), len(sequence_y)
        
        if length_x == 0 or length_y == 0:
            return 0, [], sequence_x, sequence_y
        
        # Normaliza sequências para usar distância cosseno (direcional)
        sequence_x_normalized = (sequence_x - np.mean(sequence_x, axis=0)) / \
                               (np.std(sequence_x, axis=0) + 1e-10)
        sequence_y_normalized = (sequence_y - np.mean(sequence_y, axis=0)) / \
                               (np.std(sequence_y, axis=0) + 1e-10)
        
        # Matriz de custo acumulado
        accumulated_cost_matrix = np.full((length_x + 1, length_y + 1), np.inf)
        accumulated_cost_matrix[0, 0] = 0
        
        if window_size is None:
            window_size = int(max(length_x, length_y) * 0.25)
        
        # Preenche matriz de custo (distância cosseno = 1 - similaridade)
        for i in range(length_x):
            for j in range(length_y):
                dot_product = np.dot(sequence_x_normalized[i], sequence_y_normalized[j])
                norm_product = np.linalg.norm(sequence_x_normalized[i]) * \
                              np.linalg.norm(sequence_y_normalized[j])
                if norm_product > 1e-10:
                    cosine_similarity = np.clip(dot_product / norm_product, -1, 1)
                    accumulated_cost_matrix[i+1, j+1] = 1 - cosine_similarity
                else:
                    accumulated_cost_matrix[i+1, j+1] = 1
        
        # Aplica janela de Sakoe-Chiba e propaga custos
        for i in range(1, length_x + 1):
            j_start = max(1, i - window_size)
            j_end = min(length_y + 1, i + window_size + 1)
            for j in range(j_start, j_end):
                accumulated_cost_matrix[i, j] += min(
                    accumulated_cost_matrix[i-1, j],       # inserção
                    accumulated_cost_matrix[i, j-1],       # deleção
                    accumulated_cost_matrix[i-1, j-1]      # match
                )
        
        # Backtracking para encontrar caminho ótimo
        optimal_alignment_path = []
        i, j = length_x, length_y
        while i > 0 and j > 0:
            optimal_alignment_path.append((i-1, j-1))
            if i == 1:
                j -= 1
            elif j == 1:
                i -= 1
            else:
                directions = [
                    accumulated_cost_matrix[i-1, j], 
                    accumulated_cost_matrix[i, j-1], 
                    accumulated_cost_matrix[i-1, j-1]
                ]
                min_direction = np.argmin(directions)
                if min_direction == 0:
                    i -= 1
                elif min_direction == 1:
                    j -= 1
                else:
                    i -= 1
                    j -= 1
        
        optimal_alignment_path.reverse()
        normalized_dtw_distance = accumulated_cost_matrix[length_x, length_y] / \
                                 len(optimal_alignment_path) if len(optimal_alignment_path) > 0 else 0
        
        return normalized_dtw_distance, optimal_alignment_path, \
               sequence_x_normalized, sequence_y_normalized
    
    def compute_rhythm_penalty(self, reference_features, test_features):
        """
        Calcula distância DTW entre features e penalidade por desvio do ritmo.
        O desvio do caminho DTW em relação à diagonal indica alteração
        no ritmo da fala (estiramento/compressão temporal).
        """
        # Transpõe para ter frames como primeira dimensão
        reference_transposed = reference_features.T
        test_transposed = test_features.T
        
        distance, alignment_path, ref_normalized, test_normalized = \
            self.compute_cosine_dtw(reference_transposed, test_transposed)
        
        # Calcula desvio do caminho DTW em relação à diagonal (ritmo perfeito)
        if len(alignment_path) > 0:
            path_as_array = np.array(alignment_path)
            n_frames_ref, n_frames_test = len(reference_transposed), len(test_transposed)
            
            # Diagonal ideal = mesmo ritmo
            linear_x = np.linspace(0, n_frames_ref - 1, len(alignment_path))
            linear_y = np.linspace(0, n_frames_test - 1, len(alignment_path))
            
            # Distância euclidiana entre caminho real e diagonal
            rhythm_deviations = np.sqrt(
                (path_as_array[:, 0] - linear_x)**2 + 
                (path_as_array[:, 1] - linear_y)**2
            )
            mean_rhythm_deviation = np.mean(rhythm_deviations)
            
            # Normaliza pela diagonal total
            diagonal_length = np.sqrt(n_frames_ref**2 + n_frames_test**2)
            rhythm_deviation_normalized = mean_rhythm_deviation / (diagonal_length + 1e-10)
            
            # Score de ritmo: desvio zero = score 100
            rhythm_score = max(0, 100 * np.exp(-rhythm_deviation_normalized * 10))
        else:
            rhythm_score = 0
            rhythm_deviation_normalized = 1.0
        
        return distance, alignment_path, ref_normalized, test_normalized, \
               rhythm_score, rhythm_deviation_normalized
    
    def compare_formant_statistics(self, reference_formants_raw, test_formants_raw):
        """
        Compara estatísticas dos formantes (F1, F2, F3) entre referência e teste.
        Aplica VTLN antes da comparação e calcula similaridade baseada
        na distância entre valores centrais com tolerâncias específicas.
        """
        # Normaliza trato vocal antes de comparar
        reference_formants = self.normalize_vocal_tract_piecewise(reference_formants_raw)
        test_formants = self.normalize_vocal_tract_piecewise(test_formants_raw)
        
        formant_comparison_statistics = {}
        
        # Pesos e tolerâncias para cada formante
        formant_weights = {'F1': 0.40, 'F2': 0.40, 'F3': 0.20}
        formant_tolerances = {'F1': 150, 'F2': 200, 'F3': 300}
        
        for formant_idx, formant_label in enumerate(['F1', 'F2', 'F3']):
            if formant_idx < reference_formants.shape[1] and \
               formant_idx < test_formants.shape[1]:
                
                # Remove valores NaN
                valid_ref = ~np.isnan(reference_formants[:, formant_idx])
                valid_test = ~np.isnan(test_formants[:, formant_idx])
                
                if np.sum(valid_ref) > 5 and np.sum(valid_test) > 5:
                    # Calcula estatísticas robustas (mediana + média)
                    median_reference = np.nanmedian(reference_formants[:, formant_idx])
                    median_test = np.nanmedian(test_formants[:, formant_idx])
                    mean_reference = np.nanmean(reference_formants[:, formant_idx])
                    mean_test = np.nanmean(test_formants[:, formant_idx])
                    
                    # Quartis para verificar sobreposição
                    q1_ref, q3_ref = np.nanpercentile(reference_formants[:, formant_idx], [25, 75])
                    q1_test, q3_test = np.nanpercentile(test_formants[:, formant_idx], [25, 75])
                    
                    # Valor central combinado (média da média e mediana)
                    central_reference = (mean_reference + median_reference) / 2
                    central_test = (mean_test + median_test) / 2
                    distance_between_formants = abs(central_reference - central_test)
                    
                    # Similaridade: 100% quando distância = 0, decai linearmente
                    tolerance_value = formant_tolerances.get(formant_label, 150)
                    formant_similarity = max(0.0, 100.0 * (1.0 - distance_between_formants / tolerance_value))
                    weighted_similarity = formant_similarity * formant_weights[formant_label]
                    
                    # Bônus por sobreposição dos quartis
                    overlap_amount = min(q3_ref, q3_test) - max(q1_ref, q1_test)
                    has_distribution_overlap = overlap_amount > 0
                    
                    if has_distribution_overlap and formant_similarity < 60:
                        formant_similarity = min(100, formant_similarity + 15)
                        weighted_similarity = formant_similarity * formant_weights[formant_label]
                    
                    formant_comparison_statistics[formant_label] = {
                        'distance': distance_between_formants,
                        'similarity': formant_similarity,
                        'weighted_similarity': weighted_similarity,
                        'weight': formant_weights[formant_label],
                        'mean_ref': central_reference,
                        'mean_test': central_test,
                        'median_ref': median_reference,
                        'median_test': median_test,
                        'q1_ref': q1_ref, 'q3_ref': q3_ref,
                        'q1_test': q1_test, 'q3_test': q3_test,
                        'tolerance': tolerance_value,
                        'has_overlap': bool(has_distribution_overlap)
                    }
        
        return formant_comparison_statistics
    
    def calculate_phonetic_score(self, mfcc_distance, formant_comparison):
        """
        Calcula score fonético combinando:
        - 60% MFCC (estrutura sonora geral, incluindo vogais)
        - 40% Formantes (articulação precisa da língua)
        """
        mfcc_score = max(0, 100 * np.exp(-mfcc_distance / 0.5))
        
        if formant_comparison:
            total_weight = sum(stats['weight'] for stats in formant_comparison.values())
            formant_score = sum(
                stats['weighted_similarity'] for stats in formant_comparison.values()
            ) / total_weight if total_weight > 0 else 50.0
        else:
            formant_score = 50.0
        
        formant_score = max(0.0, formant_score)
        phonetic_final_score = 0.6 * mfcc_score + 0.4 * formant_score
        
        return phonetic_final_score, mfcc_score, formant_score

    # ================================================================
    # SISTEMA DE ALERTAS DIAGNÓSTICOS REFINADO (V2)
    # Regras mais sensíveis para detectar padrões específicos de erro:
    # - Omissão: foco no ritmo DTW, não na duração total
    # - Articulação: limiar F2 elevado para 75% quando MFCC > 85%
    # - Tonicidade: cruzamento de Energia + Correlação de Pitch
    # ================================================================
    
    def generate_diagnostic_alerts(self, analysis_metrics):
        """
        Gera alertas diagnósticos baseados nas métricas extraídas.
        Cada regra combina múltiplos indicadores para reduzir falsos positivos.
        """
        diagnostic_alerts = []
        
        # Extrai todas as métricas relevantes
        duration_reference = analysis_metrics.get('duration_ref', 0)
        duration_test = analysis_metrics.get('duration_test', 0)
        rhythm_score = analysis_metrics.get('rhythm_score', 100)
        rhythm_deviation_value = analysis_metrics.get('rhythm_deviation', 0)
        mfcc_score = analysis_metrics.get('mfcc_score', 100)
        formant_statistics = analysis_metrics.get('formant_stats', {})
        f2_similarity = formant_statistics.get('F2', {}).get('similarity', 100)
        f3_similarity = formant_statistics.get('F3', {}).get('similarity', 100)
        f1_similarity = formant_statistics.get('F1', {}).get('similarity', 100)
        energy_score = analysis_metrics.get('energy_score', 100)
        tonic_match = analysis_metrics.get('tonic_match', True)
        pitch_correlation = analysis_metrics.get('pitch_correlation', 0)
        pitch_score = analysis_metrics.get('pitch_score', 100)
        final_score = analysis_metrics.get('final_score', 100)
        phonetic_score = analysis_metrics.get('phonetic_score', 100)
        prosody_score = analysis_metrics.get('prosody_score', 100)
        
        # ============================================================
        # REGRA 1: OMISSÃO - Foco no RITMO, não na duração total
        # O cérebro alonga vogais para compensar consoantes omitidas
        # mantendo a duração total similar. O DTW revela o "engasgo".
        # ============================================================
        
        rhythm_is_poor = rhythm_score < 60
        rhythm_is_very_poor = rhythm_score < 45
        deviation_is_high = rhythm_deviation_value > 0.25
        
        # Verifica também duração reduzida (caso clássico de omissão)
        if duration_reference > 0:
            duration_ratio = duration_test / duration_reference
            is_duration_shorter = duration_ratio < 0.85
        else:
            duration_ratio = 1.0
            is_duration_shorter = False
        
        # Dispara alerta de omissão se: Ritmo muito ruim OU (Ritmo ruim + duração curta)
        if rhythm_is_very_poor or (rhythm_is_poor and is_duration_shorter) or \
           (rhythm_is_poor and deviation_is_high):
            
            if rhythm_is_very_poor:
                omission_severity = "ALTA"
                omission_detail = "Ritmo severamente comprometido"
            elif rhythm_is_poor and is_duration_shorter:
                omission_severity = "ALTA"
                omission_detail = f"Ritmo irregular + fala {duration_ratio*100:.0f}% mais curta"
            else:
                omission_severity = "MÉDIA"
                omission_detail = "Ritmo irregular detectado (possível alongamento compensatório)"
            
            diagnostic_alerts.append({
                'type': 'OMISSÃO',
                'title': 'Possível Omissão de Som/Sílaba',
                'severity': omission_severity,
                'message': (
                    f"⚠️ ALERTA DE OMISSÃO: {omission_detail}. "
                    f"Ritmo DTW: {rhythm_score:.1f}% | Desvio: {rhythm_deviation_value:.3f}. "
                    f"O paciente pode ter omitido um fonema, alongando vogais "
                    f"para compensar o tempo (duração total: {duration_ratio*100:.0f}%)."
                ),
                'details': {
                    'rhythm_score': f'{rhythm_score:.1f}%',
                    'dtw_deviation': f'{rhythm_deviation_value:.3f}',
                    'duration_ratio': f'{duration_ratio*100:.0f}%',
                    'duration_ref': f'{duration_reference:.2f}s',
                    'duration_test': f'{duration_test:.2f}s'
                },
                'recommendation': (
                    "💡 Sugestão: Solicitar repetição mais pausada, marcando "
                    "cada sílaba com palmas. Verificar se o paciente está "
                    "omitindo consoantes mediais (como /d/ em 'bom dia') "
                    "ou encontros consonantais."
                ),
                'icon': '🗣️💨'
            })
        
        # ============================================================
        # REGRA 2: ARTICULAÇÃO FRACA - Limiar F2 elevado para 75%
        # Como as vogais dominam o MFCC, a nota base será alta
        # se as vogais estiverem corretas. F2 abaixo de 75%
        # já indica problema na posição da língua.
        # ============================================================
        
        mfcc_is_very_high = mfcc_score > 85   # Vogais estão perfeitas
        mfcc_is_high = mfcc_score > 70        # Vogais estão boas
        
        # Limiar: F2 abaixo de 75% já é suspeito de má articulação
        f2_is_compromised = f2_similarity < 75
        f2_is_very_bad = f2_similarity < 60
        f3_is_compromised = f3_similarity < 70
        
        # Cenário 1: MFCC muito alto (>85%) + F2 abaixo de 75%
        # = Vogais perfeitas, mas língua não foi para o lugar certo
        if mfcc_is_very_high and f2_is_compromised:
            if f2_is_very_bad:
                articulation_severity = "ALTA"
                articulation_detail = "desvio significativo na posição da língua"
            else:
                articulation_severity = "MÉDIA"
                articulation_detail = "leve imprecisão no ponto articulatório"
            
            diagnostic_alerts.append({
                'type': 'ARTICULAÇÃO',
                'title': 'Possível Troca ou Suavização de Consoante',
                'severity': articulation_severity,
                'message': (
                    f"⚠️ ALERTA DE ARTICULAÇÃO: Som base (vogais) preservado "
                    f"(MFCC: {mfcc_score:.1f}%), mas posição da língua incorreta "
                    f"(F2: {f2_similarity:.1f}%). "
                    f"Detectado {articulation_detail}. "
                    f"Possível troca ou suavização de consoante "
                    f"(ex: /d/→/∅/, /t/→/∅/, /b/→/v/)."
                ),
                'details': {
                    'mfcc_score': f'{mfcc_score:.1f}%',
                    'f2_similarity': f'{f2_similarity:.1f}%',
                    'f3_similarity': f'{f3_similarity:.1f}%',
                    'interpretation': (
                        'MFCC > 85% + F2 < 75% = Vogais corretas, '
                        'mas língua não atingiu ponto de articulação esperado. '
                        'Assinatura acústica de consoante omitida ou substituída.'
                    )
                },
                'recommendation': (
                    "💡 Sugestão: Focar em exercícios de ponto articulatório "
                    "para consoantes alveolares (/t/, /d/, /n/, /l/) e "
                    "bilabiais (/p/, /b/, /m/). Usar pistas visuais (espelho) "
                    "para mostrar posição correta da língua."
                ),
                'icon': '👅📍'
            })
        
        # Cenário 2: MFCC alto (>70%) + F2 muito ruim (<60%)
        elif mfcc_is_high and f2_is_very_bad:
            diagnostic_alerts.append({
                'type': 'ARTICULAÇÃO',
                'title': 'Possível Troca Significativa de Consoante',
                'severity': 'ALTA',
                'message': (
                    f"⚠️ ALERTA DE ARTICULAÇÃO: Estrutura vocálica parcialmente "
                    f"preservada (MFCC: {mfcc_score:.1f}%), mas articulação da "
                    f"língua muito imprecisa (F2: {f2_similarity:.1f}%). "
                    f"Provável substituição ou omissão de consoante."
                ),
                'details': {
                    'mfcc_score': f'{mfcc_score:.1f}%',
                    'f2_similarity': f'{f2_similarity:.1f}%'
                },
                'recommendation': (
                    "💡 Sugestão: Avaliação detalhada da articulação. "
                    "Praticar contraste entre pares mínimos "
                    "(ex: 'dia' vs 'ia', 'pato' vs 'ato')."
                ),
                'icon': '👅⚠️'
            })
        
        # ============================================================
        # REGRA 3: TONICIDADE - Cruzamento de Energia + Pitch
        # Se o pico de energia está no lugar errado (>30% de distância)
        # E a correlação de pitch é baixa ou negativa = sílaba tônica trocada
        # ============================================================
        
        energy_is_poor = energy_score < 70
        energy_is_very_poor = energy_score < 50
        tonic_is_wrong_position = not tonic_match
        pitch_is_inverted = pitch_correlation < -0.15   # Correlação negativa
        pitch_is_very_poor = pitch_score < 45
        
        # Cenário principal: Energia ruim + Pitch invertido/ruim
        if (energy_is_poor or tonic_is_wrong_position) and \
           (pitch_is_inverted or pitch_is_very_poor):
            
            if energy_is_very_poor and pitch_is_inverted:
                tonic_severity = "ALTA"
                tonic_detail = "pico de energia deslocado E entonação invertida"
            elif tonic_is_wrong_position and pitch_is_inverted:
                tonic_severity = "ALTA"
                tonic_detail = "sílaba tônica deslocada com inversão melódica"
            elif energy_is_poor and pitch_is_inverted:
                tonic_severity = "MÉDIA"
                tonic_detail = "possível deslocamento da sílaba tônica"
            else:
                tonic_severity = "BAIXA"
                tonic_detail = "leve inconsistência na prosódia"
            
            diagnostic_alerts.append({
                'type': 'TONICIDADE',
                'title': 'Possível Deslocamento da Sílaba Tônica',
                'severity': tonic_severity,
                'message': (
                    f"⚠️ ALERTA DE TONICIDADE: {tonic_detail}. "
                    f"Energia: {energy_score:.1f}% | "
                    f"Pitch (corr): {pitch_correlation:.3f} | "
                    f"Tônica alinhada: {'Sim' if tonic_match else 'Não'}. "
                    f"O paciente parece ter forçado a sílaba tônica "
                    f"no lugar errado ou alterado a intenção da frase."
                ),
                'details': {
                    'energy_score': f'{energy_score:.1f}%',
                    'pitch_score': f'{pitch_score:.1f}%',
                    'pitch_correlation': f'{pitch_correlation:.3f}',
                    'tonic_match': 'Sim' if tonic_match else 'Não',
                    'interpretation': (
                        'Energia < 70% + Pitch corr < -0.15 = '
                        'Acento tônico e entonação deslocados. '
                        'Assinatura de "bom diá" (forçou sílaba errada).'
                    )
                },
                'recommendation': (
                    "💡 Sugestão: Trabalhar prosódia com gestos ou batidas "
                    "para marcar a sílaba tônica correta. "
                    "Praticar contraste: 'BOM dia' vs 'bom DIa'. "
                    "Usar espelho para observar movimento da mandíbula "
                    "na sílaba tônica."
                ),
                'icon': '📈🗣️'
            })
        
        # Cenário secundário: Apenas energia ruim (sem inversão de pitch)
        elif energy_is_poor and tonic_is_wrong_position:
            diagnostic_alerts.append({
                'type': 'TONICIDADE',
                'title': 'Possível Deslocamento da Sílaba Tônica (Leve)',
                'severity': 'BAIXA',
                'message': (
                    f"⚠️ Pico de energia deslocado (Score: {energy_score:.1f}%), "
                    f"mas entonação preservada. Possível leve deslocamento "
                    f"da sílaba tônica sem inversão melódica."
                ),
                'details': {
                    'energy_score': f'{energy_score:.1f}%',
                    'pitch_correlation': f'{pitch_correlation:.3f}'
                },
                'recommendation': "💡 Sugestão: Atenção à intensidade na sílaba tônica.",
                'icon': '📈'
            })
        
        # ============================================================
        # REGRA 4: ALERTA COMBINADO - Omissão + Articulação
        # ============================================================
        
        has_omission_detected = any(a['type'] == 'OMISSÃO' for a in diagnostic_alerts)
        has_articulation_detected = any(a['type'] == 'ARTICULAÇÃO' for a in diagnostic_alerts)
        
        if has_omission_detected and has_articulation_detected:
            diagnostic_alerts.append({
                'type': 'COMBINADO',
                'title': 'Diagnóstico Combinado: Omissão de Consoante',
                'severity': 'ALTA',
                'message': (
                    f"🔴 DIAGNÓSTICO COMBINADO: Foram detectados simultaneamente "
                    f"indícios de omissão de som E imprecisão na articulação da "
                    f"língua. Quadro compatível com omissão de consoante medial "
                    f"(como o /d/ em 'bom dia' → 'bom ia')."
                ),
                'details': {
                    'rhythm_score': f'{rhythm_score:.1f}%',
                    'f2_similarity': f'{f2_similarity:.1f}%',
                    'mfcc_score': f'{mfcc_score:.1f}%'
                },
                'recommendation': (
                    "💡 Recomendação: Priorizar exercícios de conscientização "
                    "do ponto articulatório. Usar técnica de 'som alvo': "
                    "prolongar a consoante alvo (/d/) antes da vogal seguinte. "
                    "Ex: 'bom dddd....ia'."
                ),
                'icon': '🔴'
            })
        
        # ============================================================
        # ALERTA POSITIVO: Pronúncia dentro do esperado
        # ============================================================
        if final_score >= 70 and len(diagnostic_alerts) == 0:
            diagnostic_alerts.append({
                'type': 'POSITIVO',
                'title': '🌟 Pronúncia Excelente!',
                'severity': 'POSITIVO',
                'message': (
                    f"✅ A pronúncia está muito próxima da referência "
                    f"(Score Final: {final_score:.1f}%). "
                    f"Todos os parâmetros analisados (fonéticos e prosódicos) "
                    f"estão dentro do esperado."
                ),
                'details': {
                    'final_score': f'{final_score:.1f}%',
                    'phonetic_score': f'{phonetic_score:.1f}%',
                    'prosody_score': f'{prosody_score:.1f}%',
                    'f2_similarity': f'{f2_similarity:.1f}%',
                    'rhythm_score': f'{rhythm_score:.1f}%'
                },
                'recommendation': "💡 Continue praticando para manter a qualidade da pronúncia!",
                'icon': '🌟'
            })
        
        # ============================================================
        # ALERTA GERAL (fallback para scores baixos sem causa específica)
        # ============================================================
        if final_score < 40 and len(diagnostic_alerts) == 0:
            diagnostic_alerts.append({
                'type': 'GERAL',
                'title': 'Diferença Global Significativa',
                'severity': 'MÉDIA',
                'message': (
                    f"⚠️ Score final baixo ({final_score:.1f}%) sem causa "
                    f"específica identificada. A pronúncia difere da referência "
                    f"em múltiplos aspectos (Fonético: {phonetic_score:.1f}%, "
                    f"Prosódia: {prosody_score:.1f}%)."
                ),
                'details': {
                    'final_score': f'{final_score:.1f}%',
                    'phonetic_score': f'{phonetic_score:.1f}%',
                    'prosody_score': f'{prosody_score:.1f}%'
                },
                'recommendation': (
                    "💡 Sugestão: Avaliação fonoaudiológica completa. "
                    "Verificar se o paciente compreendeu o modelo a ser repetido."
                ),
                'icon': '🔍'
            })
        
        return diagnostic_alerts


# ================================================================
# PONTO DE ENTRADA: Função principal que recebe dois arquivos de áudio
# ENTRADA: reference_audio_path e test_audio_path (strings com caminhos)
# ================================================================

def compare_audio_pronunciation(reference_audio_path, test_audio_path):
    """
    Função principal de análise fonética comparativa.
    
    ENTRADA (INPUT):
        reference_audio_path: str - Caminho para o arquivo de áudio de referência
        test_audio_path: str - Caminho para o arquivo de áudio do paciente/teste
    
    SAÍDA (OUTPUT):
        dict/JSON com:
        - final_score: Nota final 0-100%
        - quality: Classificação qualitativa
        - phonetic_score, prosody_score: Scores separados
        - mfcc_score, formant_score: Componentes fonéticos
        - pitch_score, rhythm_score, energy_score: Componentes prosódicos
        - formant_stats: Estatísticas F1, F2, F3
        - diagnostic_alerts: Lista de alertas diagnósticos
        - duration_ref, duration_test: Durações em segundos
    """
    print("="*70)
    print("🔬 ANÁLISE FONÉTICA v5.0 - DIAGNÓSTICO REFINADO")
    print("="*70)
    
    # Valida existência dos arquivos de entrada
    for audio_path in [reference_audio_path, test_audio_path]:
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Arquivo não encontrado: {audio_path}")
    
    # Inicializa o analisador fonético
    phonetic_analyzer = PhoneticAnalyzer(sample_rate=22050)
    
    # ============================================================
    # PASSO 1: Carregamento dos áudios e VAD
    # ============================================================
    print("\n📁 Carregando áudios...")
    reference_audio_signal, sample_rate = librosa.load(
        reference_audio_path, sr=22050, mono=True
    )
    test_audio_signal, _ = librosa.load(
        test_audio_path, sr=22050, mono=True
    )
    
    # Remove silêncios usando Voice Activity Detection
    reference_voice_only, reference_duration_seconds = \
        phonetic_analyzer.detect_voice_activity(reference_audio_signal, sample_rate)
    test_voice_only, test_duration_seconds = \
        phonetic_analyzer.detect_voice_activity(test_audio_signal, sample_rate)
    
    print(f"   • Duração Referência: {reference_duration_seconds:.2f}s")
    print(f"   • Duração Teste: {test_duration_seconds:.2f}s")
    
    # ============================================================
    # PASSO 2: Extração de Features Fonéticas (MFCC + Formantes)
    # ============================================================
    print("\n🔤 Extraindo features fonéticas...")
    
    # MFCC: Representação espectral compacta (timbres, vogais)
    mfcc_features_reference, mfcc_static_reference, _, _ = \
        phonetic_analyzer.extract_mfcc_features(reference_voice_only, sample_rate)
    mfcc_features_test, mfcc_static_test, _, _ = \
        phonetic_analyzer.extract_mfcc_features(test_voice_only, sample_rate)
    
    # DTW com penalidade de ritmo: Alinha sequências temporalmente
    mfcc_dtw_distance, dtw_alignment_path, mfcc_ref_normalized, mfcc_test_normalized, \
    rhythm_penalty_score, rhythm_deviation_normalized = \
        phonetic_analyzer.compute_rhythm_penalty(mfcc_features_reference, mfcc_features_test)
    
    # Formantes: F1, F2, F3 (posição da língua, ponto articulatório)
    reference_formants, _ = phonetic_analyzer.extract_formants_robust(
        reference_voice_only, sample_rate
    )
    test_formants, _ = phonetic_analyzer.extract_formants_robust(
        test_voice_only, sample_rate
    )
    
    # Compara formantes com VTLN para normalizar trato vocal
    formant_comparison_results = phonetic_analyzer.compare_formant_statistics(
        reference_formants, test_formants
    )
    
    # Score fonético combinado
    phonetic_final_score, mfcc_component_score, formant_component_score = \
        phonetic_analyzer.calculate_phonetic_score(mfcc_dtw_distance, formant_comparison_results)
    
    # ============================================================
    # PASSO 3: Análise Prosódica (Pitch + Energia)
    # ============================================================
    print("\n🎵 Analisando prosódia (entonação + ritmo + energia)...")
    
    # Pitch (F0): Entonação e melodia da fala (normalizado)
    reference_pitch_normalized, _, _, _ = phonetic_analyzer.extract_normalized_pitch(
        reference_voice_only, sample_rate
    )
    test_pitch_normalized, _, _, _ = phonetic_analyzer.extract_normalized_pitch(
        test_voice_only, sample_rate
    )
    pitch_comparison_results = phonetic_analyzer.compare_pitch_patterns(
        reference_pitch_normalized, test_pitch_normalized
    )
    
    # Envelope de Energia: Localização da sílaba tônica
    reference_energy_envelope, reference_peaks_sorted, _ = \
        phonetic_analyzer.extract_energy_envelope(reference_voice_only, sample_rate)
    test_energy_envelope, test_peaks_sorted, _ = \
        phonetic_analyzer.extract_energy_envelope(test_voice_only, sample_rate)
    energy_comparison_results = phonetic_analyzer.compare_energy_patterns(
        reference_energy_envelope, test_energy_envelope,
        reference_peaks_sorted, test_peaks_sorted
    )
    
    # Score prosódico: 40% pitch + 30% ritmo + 30% energia
    prosody_combined_score = 0.4 * pitch_comparison_results['pitch_score'] + \
                             0.3 * rhythm_penalty_score + \
                             0.3 * energy_comparison_results['energy_score']
    
    # ============================================================
    # PASSO 4: Cálculo do Score Final
    # ============================================================
    final_pronunciation_score = 0.6 * phonetic_final_score + 0.4 * prosody_combined_score
    
    # Classificação qualitativa
    if final_pronunciation_score >= 75:
        pronunciation_quality = "Excelente"
    elif final_pronunciation_score >= 60:
        pronunciation_quality = "Muito Boa"
    elif final_pronunciation_score >= 45:
        pronunciation_quality = "Boa"
    elif final_pronunciation_score >= 30:
        pronunciation_quality = "Regular"
    else:
        pronunciation_quality = "Diferente"
    
    print(f"\n🏆 Score Final: {final_pronunciation_score:.1f}% ({pronunciation_quality})")
    
    # ============================================================
    # PASSO 5: Compilação de métricas e geração de diagnóstico
    # ============================================================
    print("\n🔔 Gerando diagnóstico automático...")
    
    # Compila todas as métricas para o gerador de alertas
    all_analysis_metrics = {
        'final_score': final_pronunciation_score,
        'phonetic_score': phonetic_final_score,
        'prosody_score': prosody_combined_score,
        'quality': pronunciation_quality,
        'mfcc_score': mfcc_component_score,
        'formant_score': formant_component_score,
        'pitch_score': pitch_comparison_results['pitch_score'],
        'pitch_correlation': pitch_comparison_results['correlation'],
        'rhythm_score': rhythm_penalty_score,
        'rhythm_deviation': rhythm_deviation_normalized,
        'energy_score': energy_comparison_results['energy_score'],
        'tonic_match': energy_comparison_results['tonic_match'],
        'formant_stats': formant_comparison_results,
        'duration_ref': reference_duration_seconds,
        'duration_test': test_duration_seconds,
        'dtw_distance': mfcc_dtw_distance
    }
    
    # Gera alertas diagnósticos baseados nas métricas
    diagnostic_alerts = phonetic_analyzer.generate_diagnostic_alerts(all_analysis_metrics)
    
    # Exibe alertas no console
    print("\n" + "="*70)
    print("📋 DIAGNÓSTICO AUTOMÁTICO")
    print("="*70)
    for alert in diagnostic_alerts:
        print(f"\n{alert['icon']} [{alert['severity']}] {alert['title']}")
        print(f"   {alert['message']}")
        if alert['type'] != 'POSITIVO':
            print(f"   {alert['recommendation']}")
    
    # ================================================================
    # PONTO DE SAÍDA: Montagem do JSON de resultado
    # SAÍDA: Dicionário com todos os resultados da análise
    # ================================================================
    
    analysis_output_json = {
        'analysis_metadata': {
            'version': '5.0',
            'sample_rate_hz': sample_rate,
            'reference_file': os.path.basename(reference_audio_path),
            'test_file': os.path.basename(test_audio_path)
        },
        'final_score': round(final_pronunciation_score, 1),
        'quality_classification': pronunciation_quality,
        'phonetic_analysis': {
            'phonetic_score': round(phonetic_final_score, 1),
            'mfcc_score': round(mfcc_component_score, 1),
            'formant_score': round(formant_component_score, 1),
            'dtw_distance': round(mfcc_dtw_distance, 4),
            'formant_details': {
                formant_name: {
                    'similarity_percent': round(stats['similarity'], 1),
                    'distance_hz': round(stats['distance'], 1),
                    'mean_reference_hz': round(stats['mean_ref'], 1),
                    'mean_test_hz': round(stats['mean_test'], 1),
                    'has_overlap': bool(stats['has_overlap'])
                }
                for formant_name, stats in formant_comparison_results.items()
            }
        },
        'prosody_analysis': {
            'prosody_score': round(prosody_combined_score, 1),
            'pitch_score': round(pitch_comparison_results['pitch_score'], 1),
            'pitch_correlation': round(pitch_comparison_results['correlation'], 4),
            'pitch_average_reference_hz': round(pitch_comparison_results['f0_mean_ref'], 1),
            'pitch_average_test_hz': round(pitch_comparison_results['f0_mean_test'], 1),
            'rhythm_score': round(rhythm_penalty_score, 1),
            'rhythm_deviation': round(rhythm_deviation_normalized, 4),
            'energy_score': round(energy_comparison_results['energy_score'], 1),
            'tonic_syllable_match': bool(energy_comparison_results['tonic_match']),
            'tonic_position_reference': round(energy_comparison_results['peak_ref_pos'], 3) 
                                       if energy_comparison_results['peak_ref_pos'] else None,
            'tonic_position_test': round(energy_comparison_results['peak_test_pos'], 3) 
                                   if energy_comparison_results['peak_test_pos'] else None
        },
        'duration_analysis': {
            'reference_duration_seconds': round(reference_duration_seconds, 2),
            'test_duration_seconds': round(test_duration_seconds, 2),
            'duration_ratio': round(test_duration_seconds / reference_duration_seconds, 2) 
                             if reference_duration_seconds > 0 else 0
        },
        'diagnostic_alerts': diagnostic_alerts
    }
    
    # ============================================================
    # Salva resultado em arquivo JSON
    # ============================================================
    output_directory = 'phonetic_analysis_results'
    os.makedirs(output_directory, exist_ok=True)
    
    json_output_path = os.path.join(output_directory, 'analysis_result.json')
    with open(json_output_path, 'w', encoding='utf-8') as json_file:
        json.dump(analysis_output_json, json_file, ensure_ascii=False, indent=2)
    
    # Salva também relatório em texto
    text_report_path = os.path.join(output_directory, 'analysis_report.txt')
    with open(text_report_path, 'w', encoding='utf-8') as text_file:
        text_file.write("RELATÓRIO DE ANÁLISE FONÉTICA v5.0\n")
        text_file.write("="*60 + "\n\n")
        text_file.write(f"Arquivo Referência: {os.path.basename(reference_audio_path)}\n")
        text_file.write(f"Arquivo Teste: {os.path.basename(test_audio_path)}\n\n")
        text_file.write(f"Score Final: {final_pronunciation_score:.1f}%\n")
        text_file.write(f"Classificação: {pronunciation_quality}\n\n")
        text_file.write(f"Score Fonético: {phonetic_final_score:.1f}%\n")
        text_file.write(f"Score Prosódico: {prosody_combined_score:.1f}%\n\n")
        text_file.write("ALERTAS DIAGNÓSTICOS:\n")
        text_file.write("-"*40 + "\n")
        for alert in diagnostic_alerts:
            text_file.write(f"\n{alert['icon']} [{alert['severity']}] {alert['title']}\n")
            text_file.write(f"{alert['message']}\n")
            if 'recommendation' in alert:
                text_file.write(f"{alert['recommendation']}\n")
    
    print(f"\n💾 Resultados salvos em: '{output_directory}/'")
    print(f"   📄 JSON: {json_output_path}")
    print(f"   📄 Relatório: {text_report_path}")
    
    return analysis_output_json


# ================================================================
# EXECUÇÃO PRINCIPAL
# ================================================================
if __name__ == "__main__":
    try:
        # ENTRADA: Defina aqui os caminhos dos arquivos de áudio
        reference_audio_file = './samples/bomdia_paulo.wav'    # Áudio de referência (modelo correto)
        test_audio_file = './samples/bom_diah.wav'             # Áudio do paciente a ser analisado
        
        # Executa análise completa
        analysis_results = compare_audio_pronunciation(reference_audio_file, test_audio_file)
        
        # SAÍDA: O resultado é um dicionário Python (equivalente a JSON)
        # que contém todos os scores, métricas e alertas diagnósticos
        print("\n✅ ANÁLISE COMPLETA!")
        print(f"\n📊 Resumo Final:")
        print(f"   Score: {analysis_results['final_score']}%")
        print(f"   Qualidade: {analysis_results['quality_classification']}")
        print(f"   Alertas: {len(analysis_results['diagnostic_alerts'])}")
        
    except FileNotFoundError as error:
        print(f"\n❌ Erro: {error}")
        print("   Certifique-se de que os arquivos de áudio existem nos caminhos especificados.")
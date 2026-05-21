"""
Comparadores de features para análise de similaridade
"""

import numpy as np
from scipy.stats import pearsonr


class FeatureComparators:
    """Responsável pela comparação de features entre áudios"""

    def __init__(self):
        """Inicializa o comparador de features"""
        pass

    def compute_cosine_dtw(self, seq_x, seq_y, window_size=None):
        len_x, len_y = len(seq_x), len(seq_y)
        if len_x == 0 or len_y == 0:
            return 0, [], seq_x, seq_y

        # Normalização
        x_norm = (seq_x - np.mean(seq_x, axis=0)) / (np.std(seq_x, axis=0) + 1e-10)
        y_norm = (seq_y - np.mean(seq_y, axis=0)) / (np.std(seq_y, axis=0) + 1e-10)

        if window_size is None:
            max_len = max(len_x, len_y)
            if max_len < 50:          # ~0,5 s (considerando hop_length=512, sr=22050 → ~23 ms/frame)
                window_size = max(1, int(max_len * 0.05))
            else:
                window_size = int(max_len * 0.10)

        # Matriz de custo preenchida com infinito (fora da banda não será usada)
        cost = np.full((len_x + 1, len_y + 1), np.inf)
        cost[0, 0] = 0

        # Preenche apenas dentro da banda, calculando o custo local e acumulando
        for i in range(1, len_x + 1):
            j_start = max(1, i - window_size)
            j_end = min(len_y + 1, i + window_size + 1)
            for j in range(j_start, j_end):
                # Custo local (distância cosseno)
                dot = np.dot(x_norm[i - 1], y_norm[j - 1])
                norm = np.linalg.norm(x_norm[i - 1]) * np.linalg.norm(y_norm[j - 1])
                if norm > 1e-10:
                    sim = np.clip(dot / norm, -1, 1)
                    local_cost = 1.0 - sim
                else:
                    local_cost = 1.0

                cost[i, j] = local_cost + min(
                    cost[i - 1, j],      # inserção
                    cost[i, j - 1],      # deleção
                    cost[i - 1, j - 1]   # match
                )

        # Backtracking (apenas se existir caminho)
        path = []
        i, j = len_x, len_y
        if np.isinf(cost[i, j]):
            # Caso extremo: sem caminho válido (sequências muito diferentes)
            return 2.0, [], x_norm, y_norm

        while i > 0 and j > 0:
            path.append((i - 1, j - 1))
            if i == 1:
                j -= 1
            elif j == 1:
                i -= 1
            else:
                directions = [cost[i - 1, j], cost[i, j - 1], cost[i - 1, j - 1]]
                min_dir = np.argmin(directions)
                if min_dir == 0:
                    i -= 1
                elif min_dir == 1:
                    j -= 1
                else:
                    i -= 1
                    j -= 1

        path.reverse()
        distance = cost[len_x, len_y] / len(path) if len(path) > 0 else 2.0
        return distance, path, x_norm, y_norm

    def compute_rhythm_penalty(self, ref_features, test_features):
        """
        Calcula distância DTW e penalidade por desvio do ritmo.

        Args:
            ref_features: Features de referência
            test_features: Features de teste

        Returns:
            tuple: (dist, path, ref_norm, test_norm, rhythm_score, deviation)
        """
        # Transpõe para ter frames como primeira dimensão
        ref_t = ref_features.T
        test_t = test_features.T

        distance, path, ref_norm, test_norm = self.compute_cosine_dtw(
            ref_t, test_t
        )

        # Calcula desvio do caminho em relação à diagonal
        if len(path) > 0:
            path_arr = np.array(path)
            n_ref, n_test = len(ref_t), len(test_t)

            linear_x = np.linspace(0, n_ref - 1, len(path))
            linear_y = np.linspace(0, n_test - 1, len(path))

            deviations = np.sqrt(
                (path_arr[:, 0] - linear_x) ** 2
                + (path_arr[:, 1] - linear_y) ** 2
            )
            mean_dev = np.mean(deviations)

            norm_len = min(n_ref, n_test)          # comprimento da sequência mais curta
            dev_norm = mean_dev / (norm_len + 1e-10)

            rhythm_score = max(0, 100 * np.exp(-dev_norm * 10))
        else:
            rhythm_score = 0
            dev_norm = 1.0

        return distance, path, ref_norm, test_norm, rhythm_score, dev_norm

    def compare_pitch_patterns(self, ref_pitch, test_pitch):
        """
        Compara os contornos de pitch entre referência e teste.

        Args:
            ref_pitch: Pitch de referência
            test_pitch: Pitch de teste

        Returns:
            dict: Métricas de comparação do pitch
        """
        # Interpola para mesmo número de pontos
        if len(ref_pitch) != len(test_pitch):
            time_ref = np.linspace(0, 1, len(ref_pitch))
            time_test = np.linspace(0, 1, len(test_pitch))
            target_len = min(len(ref_pitch), len(test_pitch))
            time_target = np.linspace(0, 1, target_len)

            pitch_ref = np.interp(time_target, time_ref, ref_pitch)
            pitch_test = np.interp(time_target, time_test, test_pitch)
        else:
            pitch_ref = ref_pitch
            pitch_test = test_pitch

        # Apenas pontos com voz
        voiced = (pitch_ref != 0) & (pitch_test != 0)

        if np.sum(voiced) > 10:
            corr, p_val = pearsonr(pitch_ref[voiced], pitch_test[voiced])
            if np.isnan(corr):
                corr, p_val = 0, 1
        else:
            corr, p_val = 0, 1

        # DTW nos segmentos com voz
        if np.sum(voiced) > 10:
            voiced_ref = pitch_ref[voiced].reshape(-1, 1)
            voiced_test = pitch_test[voiced].reshape(-1, 1)
        else:
            voiced_ref = np.zeros((1, 1))
            voiced_test = np.zeros((1, 1))

        MAX_DTW = 500
        if len(voiced_ref) > MAX_DTW:
            indices = np.linspace(0, len(voiced_ref) - 1, MAX_DTW, dtype=int)
            voiced_ref = voiced_ref[indices]
        if len(voiced_test) > MAX_DTW:
            indices = np.linspace(0, len(voiced_test) - 1, MAX_DTW, dtype=int)
            voiced_test = voiced_test[indices]

        if len(voiced_ref) > 1 and len(voiced_test) > 1:
            window = int(min(len(voiced_ref), len(voiced_test)) * 0.3)
            dtw_dist, _, _, _ = self.compute_cosine_dtw(
                voiced_ref, voiced_test, window_size=window
            )
        else:
            dtw_dist = 1.0

        # Converte para scores 0-100
        corr_score = max(0, min(100, (corr + 1) * 50))
        dtw_score = max(0, 100 * np.exp(-dtw_dist / 0.3))
        pitch_score = 0.6 * corr_score + 0.4 * dtw_score

        # Médias do F0 original
        avg_ref = np.mean(ref_pitch[ref_pitch > 0]) if np.any(
            ref_pitch > 0
        ) else 0
        avg_test = np.mean(test_pitch[test_pitch > 0]) if np.any(
            test_pitch > 0
        ) else 0

        return {
            'pitch_score': pitch_score,
            'correlation': corr,
            'p_value': p_val,
            'dtw_distance': dtw_dist,
            'f0_mean_ref': avg_ref,
            'f0_mean_test': avg_test
        }

    def compare_energy_patterns(
        self,
        ref_envelope,
        test_envelope,
        ref_peaks,
        test_peaks
    ):
        """
        Compara envelopes de energia entre referência e teste.

        Args:
            ref_envelope: Envelope de energia de referência
            test_envelope: Envelope de energia de teste
            ref_peaks: Picos de energia de referência
            test_peaks: Picos de energia de teste

        Returns:
            dict: Métricas de comparação da energia
        """
        # Interpola para mesmo comprimento
        if len(ref_envelope) != len(test_envelope):
            time_ref = np.linspace(0, 1, len(ref_envelope))
            time_test = np.linspace(0, 1, len(test_envelope))
            target_len = min(len(ref_envelope), len(test_envelope))
            time_target = np.linspace(0, 1, target_len)

            env_ref = np.interp(time_target, time_ref, ref_envelope)
            env_test = np.interp(time_target, time_test, test_envelope)
        else:
            env_ref = ref_envelope
            env_test = test_envelope

        # Correlação entre os envelopes
        if len(env_ref) > 1 and len(env_test) > 1:
            corr, _ = pearsonr(env_ref, env_test)
            if np.isnan(corr):
                corr = 0
        else:
            corr = 0

        energy_score = max(0, min(100, (corr + 1) * 50))

        # Verifica se o pico principal está na mesma posição
        tonic_match = False
        tonic_pos_ref = None
        tonic_pos_test = None

        if len(ref_peaks) > 0 and len(test_peaks) > 0:
            tonic_pos_ref = ref_peaks[0] / len(ref_envelope) if len(
                ref_envelope
            ) > 0 else 0.5
            tonic_pos_test = test_peaks[0] / len(test_envelope) if len(
                test_envelope
            ) > 0 else 0.5
            tonic_match = abs(tonic_pos_ref - tonic_pos_test) < 0.2

        return {
            'energy_score': energy_score,
            'correlation': corr,
            'tonic_match': bool(tonic_match),
            'peak_ref_pos': tonic_pos_ref,
            'peak_test_pos': tonic_pos_test,
        }

    def compare_formant_statistics(self, ref_formants_raw, test_formants_raw,
                                   feature_extractor):
        """
        Compara estatísticas dos formantes (F1, F2, F3).

        Args:
            ref_formants_raw: Formantes de referência
            test_formants_raw: Formantes de teste
            feature_extractor: Instância do FeatureExtractor

        Returns:
            dict: Estatísticas de comparação dos formantes
        """
        # Normaliza trato vocal antes de comparar
        ref_formants = feature_extractor.normalize_vocal_tract_piecewise(
            ref_formants_raw
        )
        test_formants = feature_extractor.normalize_vocal_tract_piecewise(
            test_formants_raw
        )

        formant_stats = {}

        # Pesos e tolerâncias para cada formante
        WEIGHTS = {'F1': 0.40, 'F2': 0.40, 'F3': 0.20}
        TOLERANCES = {'F1': 150, 'F2': 200, 'F3': 300}

        for idx, label in enumerate(['F1', 'F2', 'F3']):
            if idx < ref_formants.shape[1] and idx < test_formants.shape[1]:

                # Remove valores NaN
                valid_ref = ~np.isnan(ref_formants[:, idx])
                valid_test = ~np.isnan(test_formants[:, idx])

                if np.sum(valid_ref) > 5 and np.sum(valid_test) > 5:
                    # Estatísticas robustas
                    median_ref = np.nanmedian(ref_formants[:, idx])
                    median_test = np.nanmedian(test_formants[:, idx])
                    mean_ref = np.nanmean(ref_formants[:, idx])
                    mean_test = np.nanmean(test_formants[:, idx])

                    # Quartis
                    q1_ref, q3_ref = np.nanpercentile(
                        ref_formants[:, idx], [25, 75]
                    )
                    q1_test, q3_test = np.nanpercentile(
                        test_formants[:, idx], [25, 75]
                    )

                    # Valor central
                    central_ref = (mean_ref + median_ref) / 2
                    central_test = (mean_test + median_test) / 2
                    distance = abs(central_ref - central_test)

                    # Similaridade
                    tol = TOLERANCES.get(label, 150)
                    similarity = max(0.0, 100.0 * (
                        1.0 - distance / tol
                    ))
                    weighted = similarity * WEIGHTS[label]

                    # Bônus por sobreposição dos quartis
                    overlap = min(q3_ref, q3_test) - max(q1_ref, q1_test)
                    has_overlap = overlap > 0

                    if has_overlap and similarity < 60:
                        similarity = min(100, similarity + 15)
                        weighted = similarity * WEIGHTS[label]

                    formant_stats[label] = {
                        'distance': distance,
                        'similarity': similarity,
                        'weighted_similarity': weighted,
                        'weight': WEIGHTS[label],
                        'mean_ref': central_ref,
                        'mean_test': central_test,
                        'median_ref': median_ref,
                        'median_test': median_test,
                        'q1_ref': q1_ref,
                        'q3_ref': q3_ref,
                        'q1_test': q1_test,
                        'q3_test': q3_test,
                        'tolerance': tol,
                        'has_overlap': bool(has_overlap)
                    }

        return formant_stats

    def calculate_phonetic_score(self, mfcc_distance, formant_comparison):
        """
        Calcula score fonético combinando MFCC e Formantes.

        Args:
            mfcc_distance: Distância DTW dos MFCCs
            formant_comparison: Resultado da comparação de formantes

        Returns:
            tuple: (score_fonetico, score_mfcc, score_formante)
        """
        mfcc_score = max(0, 100 * np.exp(-mfcc_distance / 0.4))

        if formant_comparison:
            total_weight = sum(
                stats['weight'] for stats in formant_comparison.values()
            )
            formant_score = sum(
                stats['weighted_similarity']
                for stats in formant_comparison.values()
            ) / total_weight if total_weight > 0 else 50.0
        else:
            formant_score = 50.0

        formant_score = max(0.0, formant_score)
        phonetic_score = 0.75 * mfcc_score + 0.25 * formant_score

        return phonetic_score, mfcc_score, formant_score

"""
Gerador de alertas diagnósticos
"""


class AlertGenerator:
    """Responsável pela geração de alertas diagnósticos"""

    def __init__(self):
        """Inicializa o gerador de alertas"""
        pass

    def generate_diagnostic_alerts(self, metrics):
        """
        Gera alertas diagnósticos baseados nas métricas extraídas.

        Cada regra combina múltiplos indicadores para reduzir falsos positivos.

        Args:
            metrics: Dicionário com todas as métricas de análise

        Returns:
            list: Lista de alertas diagnósticos
        """
        alerts = []

        # Extrai métricas
        dur_ref = metrics.get('duration_ref', 0)
        dur_test = metrics.get('duration_test', 0)
        rhythm_score = metrics.get('rhythm_score', 100)
        rhythm_dev = metrics.get('rhythm_deviation', 0)
        mfcc_score = metrics.get('mfcc_score', 100)
        formant_stats = metrics.get('formant_stats', {})
        f2_sim = formant_stats.get('F2', {}).get('similarity', 100)
        f3_sim = formant_stats.get('F3', {}).get('similarity', 100)
        energy_score = metrics.get('energy_score', 100)
        tonic_match = metrics.get('tonic_match', True)
        pitch_corr = metrics.get('pitch_correlation', 0)
        pitch_score = metrics.get('pitch_score', 100)
        final_score = metrics.get('final_score', 100)
        phonetic_score = metrics.get('phonetic_score', 100)
        prosody_score = metrics.get('prosody_score', 100)

        # ============================================================
        # REGRA 1: OMISSÃO - Foco no RITMO
        # ============================================================

        rhythm_poor = rhythm_score < 60
        rhythm_very_poor = rhythm_score < 45
        dev_high = rhythm_dev > 0.25

        if dur_ref > 0:
            dur_ratio = dur_test / dur_ref
            is_shorter = dur_ratio < 0.85
        else:
            dur_ratio = 1.0
            is_shorter = False

        if rhythm_very_poor or (rhythm_poor and is_shorter) or (
            rhythm_poor and dev_high
        ):

            if rhythm_very_poor:
                severity = "ALTA"
                detail = "Ritmo severamente comprometido"
            elif rhythm_poor and is_shorter:
                severity = "ALTA"
                detail = f"Ritmo irregular + fala {dur_ratio*100:.0f}% mais curta"
            else:
                severity = "MÉDIA"
                detail = "Ritmo irregular detectado"

            alerts.append({
                'type': 'OMISSÃO',
                'title': 'Possível Omissão de Som/Sílaba',
                'severity': severity,
                'message': (
                    f"⚠️ ALERTA DE OMISSÃO: {detail}. "
                    f"Ritmo DTW: {rhythm_score:.1f}% | "
                    f"Desvio: {rhythm_dev:.3f}. "
                    f"O paciente pode ter omitido um fonema, alongando vogais "
                    f"para compensar o tempo (duração total: {dur_ratio*100:.0f}%)."
                ),
                'details': {
                    'rhythm_score': f'{rhythm_score:.1f}%',
                    'dtw_deviation': f'{rhythm_dev:.3f}',
                    'duration_ratio': f'{dur_ratio*100:.0f}%',
                    'duration_ref': f'{dur_ref:.2f}s',
                    'duration_test': f'{dur_test:.2f}s'
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
        # REGRA 2: ARTICULAÇÃO FRACA
        # ============================================================

        mfcc_very_high = mfcc_score > 85
        mfcc_high = mfcc_score > 70

        f2_compromised = f2_sim < 75
        f2_very_bad = f2_sim < 60

        if mfcc_very_high and f2_compromised:
            if f2_very_bad:
                severity = "ALTA"
                detail = "desvio significativo na posição da língua"
            else:
                severity = "MÉDIA"
                detail = "leve imprecisão no ponto articulatório"

            alerts.append({
                'type': 'ARTICULAÇÃO',
                'title': 'Possível Troca ou Suavização de Consoante',
                'severity': severity,
                'message': (
                    f"⚠️ ALERTA DE ARTICULAÇÃO: Som base (vogais) preservado "
                    f"(MFCC: {mfcc_score:.1f}%), mas posição da língua incorreta "
                    f"(F2: {f2_sim:.1f}%). "
                    f"Detectado {detail}. "
                    f"Possível troca ou suavização de consoante "
                    f"(ex: /d/→/∅/, /t/→/∅/, /b/→/v/)."
                ),
                'details': {
                    'mfcc_score': f'{mfcc_score:.1f}%',
                    'f2_similarity': f'{f2_sim:.1f}%',
                    'f3_similarity': f'{f3_sim:.1f}%',
                    'interpretation': (
                        'MFCC > 85% + F2 < 75% = Vogais corretas, '
                        'mas língua não atingiu ponto de articulação esperado.'
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

        elif mfcc_high and f2_very_bad:
            alerts.append({
                'type': 'ARTICULAÇÃO',
                'title': 'Possível Troca Significativa de Consoante',
                'severity': 'ALTA',
                'message': (
                    f"⚠️ ALERTA DE ARTICULAÇÃO: Estrutura vocálica parcialmente "
                    f"preservada (MFCC: {mfcc_score:.1f}%), mas articulação da "
                    f"língua muito imprecisa (F2: {f2_sim:.1f}%). "
                    f"Provável substituição ou omissão de consoante."
                ),
                'details': {
                    'mfcc_score': f'{mfcc_score:.1f}%',
                    'f2_similarity': f'{f2_sim:.1f}%'
                },
                'recommendation': (
                    "💡 Sugestão: Avaliação detalhada da articulação. "
                    "Praticar contraste entre pares mínimos "
                    "(ex: 'dia' vs 'ia', 'pato' vs 'ato')."
                ),
                'icon': '👅⚠️'
            })

        # ============================================================
        # REGRA 3: TONICIDADE
        # ============================================================

        energy_poor = energy_score < 70
        energy_very_poor = energy_score < 50
        tonic_wrong = not tonic_match
        pitch_inverted = pitch_corr < -0.15
        pitch_very_poor = pitch_score < 45

        if (energy_poor or tonic_wrong) and (pitch_inverted or pitch_very_poor):

            if energy_very_poor and pitch_inverted:
                severity = "ALTA"
                detail = "pico de energia deslocado E entonação invertida"
            elif tonic_wrong and pitch_inverted:
                severity = "ALTA"
                detail = "sílaba tônica deslocada com inversão melódica"
            elif energy_poor and pitch_inverted:
                severity = "MÉDIA"
                detail = "possível deslocamento da sílaba tônica"
            else:
                severity = "BAIXA"
                detail = "leve inconsistência na prosódia"

            alerts.append({
                'type': 'TONICIDADE',
                'title': 'Possível Deslocamento da Sílaba Tônica',
                'severity': severity,
                'message': (
                    f"⚠️ ALERTA DE TONICIDADE: {detail}. "
                    f"Energia: {energy_score:.1f}% | "
                    f"Pitch (corr): {pitch_corr:.3f} | "
                    f"Tônica alinhada: {'Sim' if tonic_match else 'Não'}. "
                    f"O paciente parece ter forçado a sílaba tônica "
                    f"no lugar errado ou alterado a intenção da frase."
                ),
                'details': {
                    'energy_score': f'{energy_score:.1f}%',
                    'pitch_score': f'{pitch_score:.1f}%',
                    'pitch_correlation': f'{pitch_corr:.3f}',
                    'tonic_match': 'Sim' if tonic_match else 'Não',
                    'interpretation': (
                        'Energia < 70% + Pitch corr < -0.15 = '
                        'Acento tônico e entonação deslocados.'
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

        elif energy_poor and tonic_wrong:
            alerts.append({
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
                    'pitch_correlation': f'{pitch_corr:.3f}'
                },
                'recommendation': (
                    "💡 Sugestão: Atenção à intensidade na sílaba tônica."
                ),
                'icon': '📈'
            })

        # ============================================================
        # REGRA 4: ALERTA COMBINADO
        # ============================================================

        has_omission = any(a['type'] == 'OMISSÃO' for a in alerts)
        has_articulation = any(a['type'] == 'ARTICULAÇÃO' for a in alerts)

        if has_omission and has_articulation:
            alerts.append({
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
                    'f2_similarity': f'{f2_sim:.1f}%',
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
        # ALERTA POSITIVO
        # ============================================================
        if final_score >= 70 and len(alerts) == 0:
            alerts.append({
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
                    'f2_similarity': f'{f2_sim:.1f}%',
                    'rhythm_score': f'{rhythm_score:.1f}%'
                },
                'recommendation': (
                    "💡 Continue praticando para manter a qualidade da pronúncia!"
                ),
                'icon': '🌟'
            })

        # ============================================================
        # ALERTA GERAL
        # ============================================================
        if final_score < 40 and len(alerts) == 0:
            alerts.append({
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

        return alerts

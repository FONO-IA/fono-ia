import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
from scipy.signal import resample
import os

def generate_mel_spectrogram(audio_path, title="Audio"):
    """
    Gera e retorna o mel spectrogram de um arquivo de áudio
    """
    # Carregar áudio (mono, taxa 22050Hz)
    y, sr = librosa.load(audio_path, sr=22050, mono=True)
    
    # Calcular mel spectrogram
    # Parâmetros padrão para boa visualização
    n_mels = 128
    hop_length = 512
    fmax = 8000  # Frequência máxima (ótimo para voz/música)
    
    mel_spec = librosa.feature.melspectrogram(
        y=y, 
        sr=sr, 
        n_mels=n_mels,
        fmax=fmax,
        hop_length=hop_length,
        n_fft=2048
    )
    
    # Converter para escala dB (log)
    mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
    
    return mel_spec_db, sr, y

def compare_spectrograms(spec1, spec2):
    """
    Compara dois spectrograms usando MSE (Mean Squared Error)
    """
    # Alinhar as dimensões (cortar no menor tempo)
    min_time = min(spec1.shape[1], spec2.shape[1])
    spec1_aligned = spec1[:, :min_time]
    spec2_aligned = spec2[:, :min_time]
    
    # Calcular MSE
    mse = np.mean((spec1_aligned - spec2_aligned) ** 2)
    
    # Calcular similaridade percentual (0-100%)
    # Fórmula: 100 * e^(-mse / threshold)
    # threshold=15 dá uma boa escala para diferenças perceptíveis
    similarity = 100 * np.exp(-mse / 15)
    similarity = min(100, max(0, similarity))  # Limitar entre 0-100
    
    # Calcular outras métricas úteis
    mae = np.mean(np.abs(spec1_aligned - spec2_aligned))  # Mean Absolute Error
    correlation = np.corrcoef(spec1_aligned.flatten(), spec2_aligned.flatten())[0, 1]
    
    return {
        'mse': mse,
        'similarity_percent': round(similarity, 2),
        'mae': mae,
        'correlation': correlation,
        'is_similar': similarity > 60  # Threshold para considerar similar
    }

def plot_comparison(spec1, spec2, metrics, title1="Audio 1", title2="Audio 2"):
    """
    Cria uma visualização completa com os dois spectrograms e a diferença
    """
    # Alinhar shapes para visualização
    min_time = min(spec1.shape[1], spec2.shape[1])
    spec1_plot = spec1[:, :min_time]
    spec2_plot = spec2[:, :min_time]
    diff = np.abs(spec1_plot - spec2_plot)
    
    # Criar figura com 3 subplots
    fig = plt.figure(figsize=(15, 10))
    
    # Plot 1: Audio 1
    ax1 = plt.subplot(3, 1, 1)
    img1 = librosa.display.specshow(
        spec1_plot, 
        sr=22050, 
        hop_length=512,
        x_axis='time', 
        y_axis='mel',
        ax=ax1
    )
    ax1.set_title(f'{title1} - Mel Spectrogram', fontsize=14, fontweight='bold')
    ax1.set_ylabel('Mel Frequency Bands')
    plt.colorbar(img1, ax=ax1, format='%+2.0f dB')
    
    # Plot 2: Audio 2
    ax2 = plt.subplot(3, 1, 2)
    img2 = librosa.display.specshow(
        spec2_plot, 
        sr=22050, 
        hop_length=512,
        x_axis='time', 
        y_axis='mel',
        ax=ax2
    )
    ax2.set_title(f'{title2} - Mel Spectrogram', fontsize=14, fontweight='bold')
    ax2.set_ylabel('Mel Frequency Bands')
    plt.colorbar(img2, ax=ax2, format='%+2.0f dB')
    
    # Plot 3: Diferença
    ax3 = plt.subplot(3, 1, 3)
    img3 = ax3.imshow(
        diff, 
        aspect='auto', 
        origin='lower',
        cmap='hot',
        extent=[0, diff.shape[1], 0, diff.shape[0]]
    )
    ax3.set_title(f'Difference Map (Heatmap of Absolute Differences)', fontsize=14, fontweight='bold')
    ax3.set_xlabel('Time Frames')
    ax3.set_ylabel('Mel Frequency Bands')
    plt.colorbar(img3, ax=ax3, label='Difference Magnitude (dB)')
    
    # Adicionar métricas como texto
    metrics_text = f"""
    COMPARISON METRICS:
    • MSE (Mean Squared Error): {metrics['mse']:.4f}
    • Similarity Score: {metrics['similarity_percent']}%
    • MAE (Mean Absolute Error): {metrics['mae']:.4f}
    • Correlation: {metrics['correlation']:.4f}
    • Verdict: {"✓ SIMILAR" if metrics['is_similar'] else "✗ DIFFERENT"}
    """
    
    plt.figtext(0.02, 0.02, metrics_text, fontsize=10, 
                bbox=dict(boxstyle="round,pad=0.5", facecolor="lightgray", alpha=0.8))
    
    plt.suptitle('Audio Comparison: Mel Spectrogram Analysis', fontsize=16, fontweight='bold', y=0.98)
    plt.tight_layout()
    plt.subplots_adjust(bottom=0.12)
    
    return fig

def create_simple_comparison_summary(spec1, spec2, metrics, name1="Audio 1", name2="Audio 2"):
    """
    Cria um resumo visual mais simples e direto
    """
    # Alinhar shapes
    min_time = min(spec1.shape[1], spec2.shape[1])
    spec1_plot = spec1[:, :min_time]
    spec2_plot = spec2[:, :min_time]
    
    # Criar figura compacta
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    
    # Audio 1
    ax1 = axes[0, 0]
    librosa.display.specshow(spec1_plot, sr=22050, hop_length=512, 
                              x_axis='time', y_axis='mel', ax=ax1)
    ax1.set_title(name1, fontsize=12, fontweight='bold')
    ax1.set_xlabel('Time')
    ax1.set_ylabel('Mel Bands')
    
    # Audio 2
    ax2 = axes[0, 1]
    librosa.display.specshow(spec2_plot, sr=22050, hop_length=512, 
                              x_axis='time', y_axis='mel', ax=ax2)
    ax2.set_title(name2, fontsize=12, fontweight='bold')
    ax2.set_xlabel('Time')
    ax2.set_ylabel('Mel Bands')
    
    # Difference
    ax3 = axes[1, 0]
    diff = np.abs(spec1_plot - spec2_plot)
    im = ax3.imshow(diff, aspect='auto', origin='lower', cmap='RdYlGn_r')
    ax3.set_title('Difference Map (Red = Different)', fontsize=12, fontweight='bold')
    ax3.set_xlabel('Time Frames')
    ax3.set_ylabel('Mel Bands')
    plt.colorbar(im, ax=ax3, label='Difference')
    
    # Metrics
    ax4 = axes[1, 1]
    ax4.axis('off')
    
    # Configurar cores baseado na similaridade
    color = 'green' if metrics['is_similar'] else 'red'
    status = "SIMILAR" if metrics['is_similar'] else "DIFFERENT"
    
    metrics_display = f"""
    {'='*30}
    COMPARISON RESULTS
    {'='*30}
    
    Similarity Score: {metrics['similarity_percent']}%
    Status: {status}
    
    {'='*30}
    Detailed Metrics:
    {'='*30}
    
    MSE: {metrics['mse']:.4f}
    MAE: {metrics['mae']:.4f}
    Correlation: {metrics['correlation']:.4f}
    
    {'='*30}
    Interpretation:
    {'='*30}
    
    MSE < 10: Very similar
    MSE 10-30: Moderately similar
    MSE > 30: Quite different
    """
    
    ax4.text(0.1, 0.5, metrics_display, fontsize=11, fontfamily='monospace',
             verticalalignment='center', bbox=dict(boxstyle="round,pad=0.8", 
                                                   facecolor=color, alpha=0.2))
    
    plt.suptitle(f'Audio Comparison Result: {status}', fontsize=14, 
                 fontweight='bold', color=color)
    plt.tight_layout()
    
    return fig

def main():
    """
    Função principal - exemplo de uso
    """
    print("="*60)
    print("MEL SPECTROGRAM COMPARISON TOOL")
    print("="*60)
    
    # ============================================
    # EXEMPLO 1: Comparar dois arquivos de áudio
    # ============================================
    
    # Substitua pelos caminhos dos seus arquivos de áudio
    audio_files = {
        'reference': './uva.wav',  # Seu áudio de referência
        'test': './luva.wav'             # Áudio para comparar
    }
    
    # Verificar se os arquivos existem, senão criar exemplos sintéticos
    import os
    for key, path in audio_files.items():
        if not os.path.exists(path):
            print(f"\n⚠️  Arquivo não encontrado: {path}")
            print(f"   Gerando áudio sintético de exemplo para '{key}'...")
            
            # Gerar áudio sintético (tom puro + ruído)
            duration = 3  # segundos
            sr = 22050
            t = np.linspace(0, duration, int(sr * duration))
            
            if key == 'reference':
                # Tom puro de 440Hz
                audio = 0.5 * np.sin(2 * np.pi * 440 * t)
            else:
                # Tom puro de 445Hz (ligeiramente diferente) + ruído
                audio = 0.5 * np.sin(2 * np.pi * 445 * t) + 0.1 * np.random.randn(len(t))
            
            # Salvar arquivo temporário
            os.makedirs('samples', exist_ok=True)
            import soundfile as sf
            sf.write(path, audio, sr)
            print(f"   ✓ Áudio sintético criado: {path}")
    
    print("\n📊 Processando áudios...")
    
    # Gerar spectrograms
    spec_ref, sr_ref, audio_ref = generate_mel_spectrogram(audio_files['reference'], "Reference")
    spec_test, sr_test, audio_test = generate_mel_spectrogram(audio_files['test'], "Test")
    
    print(f"✓ Spectrogram referência: {spec_ref.shape}")
    print(f"✓ Spectrogram teste: {spec_test.shape}")
    
    # Comparar
    print("\n🔍 Comparando spectrograms...")
    metrics = compare_spectrograms(spec_ref, spec_test)
    
    print("\n" + "="*60)
    print("RESULTADOS DA COMPARAÇÃO")
    print("="*60)
    print(f"📊 MSE (Mean Squared Error): {metrics['mse']:.4f}")
    print(f"🎯 Similaridade: {metrics['similarity_percent']}%")
    print(f"📈 MAE (Mean Absolute Error): {metrics['mae']:.4f}")
    print(f"🔗 Correlação: {metrics['correlation']:.4f}")
    print(f"\n✅ VEREDICTO: {'ÁUDIOS SIMILARES' if metrics['is_similar'] else 'ÁUDIOS DIFERENTES'}")
    
    if metrics['similarity_percent'] >= 80:
        print("   → Os áudios são muito próximos!")
    elif metrics['similarity_percent'] >= 60:
        print("   → Os áudios têm similaridade moderada")
    elif metrics['similarity_percent'] >= 40:
        print("   → Os áudios são um pouco diferentes")
    else:
        print("   → Os áudios são bastante diferentes!")
    
    # ============================================
    # VISUALIZAÇÃO 1: Comparação completa
    # ============================================
    print("\n🎨 Gerando visualização completa...")
    fig_full = plot_comparison(
        spec_ref, spec_test, metrics,
        title1="Audio Reference", 
        title2="Audio Test"
    )
    plt.show()
    
    # ============================================
    # VISUALIZAÇÃO 2: Resumo simplificado
    # ============================================
    print("\n🎨 Gerando resumo simplificado...")
    fig_simple = create_simple_comparison_summary(
        spec_ref, spec_test, metrics,
        name1="Reference Audio", 
        name2="Test Audio"
    )
    plt.show()
    
    # ============================================
    # SALVAR RESULTADOS
    # ============================================
    output_dir = 'comparison_results'
    os.makedirs(output_dir, exist_ok=True)
    
    # Salvar figuras
    fig_full.savefig(f'{output_dir}/full_comparison.png', dpi=150, bbox_inches='tight')
    fig_simple.savefig(f'{output_dir}/simple_summary.png', dpi=150, bbox_inches='tight')
    
    # Salvar métricas em arquivo texto
    with open(f'{output_dir}/metrics.txt', 'w') as f:
        f.write("AUDIO COMPARISON METRICS\n")
        f.write("="*40 + "\n\n")
        f.write(f"Reference Audio: {audio_files['reference']}\n")
        f.write(f"Test Audio: {audio_files['test']}\n\n")
        f.write(f"MSE: {metrics['mse']:.6f}\n")
        f.write(f"Similarity Score: {metrics['similarity_percent']}%\n")
        f.write(f"MAE: {metrics['mae']:.6f}\n")
        f.write(f"Correlation: {metrics['correlation']:.6f}\n")
        f.write(f"Verdict: {'SIMILAR' if metrics['is_similar'] else 'DIFFERENT'}\n")
    
    print(f"\n💾 Resultados salvos em: '{output_dir}/'")
    print(f"   - full_comparison.png (comparação detalhada)")
    print(f"   - simple_summary.png (resumo compacto)")
    print(f"   - metrics.txt (métricas em texto)")
    
    # ============================================
    # INTERPRETAÇÃO DAS MÉTRICAS
    # ============================================
    print("\n" + "="*60)
    print("INTERPRETAÇÃO DAS MÉTRICAS")
    print("="*60)
    print("""
    MSE (Mean Squared Error):
    • < 10  → Áudios muito similares
    • 10-30 → Similaridade moderada
    • > 30  → Áudios diferentes
    
    Similarity Score:
    • 80-100% → Alta similaridade
    • 60-80%  → Média similaridade
    • 40-60%  → Baixa similaridade
    • < 40%    → Muito diferentes
    
    Correlação:
    • > 0.8 → Forte correlação positiva
    • 0.5-0.8 → Correlação moderada
    • < 0.5 → Baixa correlação
    """)
    
    print("\n✅ Processamento concluído!")

# Script para testar com seus próprios arquivos
def compare_my_audios(ref_path, test_path):
    """
    Função rápida para comparar dois áudios específicos
    
    Uso:
    compare_my_audios('meu_audio_referencia.wav', 'meu_audio_teste.wav')
    """
    print(f"\n🔍 Comparando: {ref_path} vs {test_path}")
    
    # Gerar spectrograms
    spec_ref, _, _ = generate_mel_spectrogram(ref_path, "Reference")
    spec_test, _, _ = generate_mel_spectrogram(test_path, "Test")
    
    # Comparar
    metrics = compare_spectrograms(spec_ref, spec_test)
    
    # Exibir resultados
    print(f"\n📊 RESULTADOS:")
    print(f"   Similaridade: {metrics['similarity_percent']}%")
    print(f"   MSE: {metrics['mse']:.4f}")
    print(f"   Status: {'SIMILAR' if metrics['is_similar'] else 'DIFERENTE'}")
    
    # Gerar visualização
    fig = plot_comparison(spec_ref, spec_test, metrics, 
                          title1=os.path.basename(ref_path),
                          title2=os.path.basename(test_path))
    plt.show()
    
    return metrics

if __name__ == "__main__":
    # Executar o exemplo principal
    main()
    
    # Exemplo de uso com seus próprios arquivos:
    # Descomente as linhas abaixo e substitua pelos caminhos dos seus áudios
    
    # compare_my_audios('./pera.wav', './pehra.wav')

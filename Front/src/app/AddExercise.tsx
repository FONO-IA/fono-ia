import React, { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import {
  criarExercicio,
  sugerirExercicioComIA,
  editarExercicio,
  uploadConteudoAudioReferencia,
} from "../services/exercicios";
import {
  ArrowLeft,
  Dumbbell,
  Target,
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
  Wand2,
  Plus,
  X,
  Mic,
} from "lucide-react";

type Level = "Fácil" | "Médio" | "Difícil";

type AiFeedback = {
  type: "success" | "error";
  message: string;
} | null;

const DEFAULT_INSTRUCTIONS = `Guia de texto para cada palavra:
                    - Diga a palavra
                    - Repita devagar
                    - Use a dica visual quando necessário`;

const LEVEL_OPTIONS: Level[] = ["Fácil", "Médio", "Difícil"];

const NIVEL_TO_API: Record<Level, string> = {
  Fácil: "FAC",
  Médio: "MED",
  Difícil: "DIF",
};

type ContentItem = {
  id: string | number;
  texto: string;
  instrucao: string;
  audioReferencia?: string;
  audioReferenciaBlob?: Blob;
};

type MicStatus = "unsupported" | "idle" | "recording" | "recorded" | "error";

export function AddExercise() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newCategory, setNewCategory] = useState("");
  const [showAiBox, setShowAiBox] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedback>(null);
  const [aiSuggestionText, setAiSuggestionText] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [instrucaoItem, setInstrucaoItem] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    objetivo: "",
    nivel: "Médio" as Level,
    instrucoesGuia: DEFAULT_INSTRUCTIONS,
    ativo: true,
  });

  const [conteudos, setConteudos] = useState<ContentItem[]>([]);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [recordingItemId, setRecordingItemId] = useState<
    string | number | null
  >(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const location = useLocation();
  const pacienteId = location.state?.pacienteId || id;
  const patientName = location.state?.patientName || "Paciente";
  const exercicioEdicao = location.state?.exercicio;
  const modoEdicao = location.state?.modo === "edicao";

  useEffect(() => {
    if (!modoEdicao || !exercicioEdicao) return;

    setNewCategory(exercicioEdicao.categoria || "");

    setForm({
      nome: exercicioEdicao.nome || "",
      objetivo: exercicioEdicao.objetivo || "",
      nivel:
        exercicioEdicao.nivel === "FAC"
          ? "Fácil"
          : exercicioEdicao.nivel === "DIF"
            ? "Difícil"
            : "Médio",
      instrucoesGuia: exercicioEdicao.instrucao || DEFAULT_INSTRUCTIONS,
      ativo: true,
    });

    if (exercicioEdicao.conteudos?.length) {
      setConteudos(
        exercicioEdicao.conteudos.map((item: any) => ({
          id: item.id,
          texto: item.texto,
          instrucao: item.instrucao,
          audioReferencia:
            item.audio_referencia ||
            item.audioReferencia ||
            item.referencia_url ||
            undefined,
        })),
      );
    } else if (exercicioEdicao.palavras?.length) {
      setConteudos(
        exercicioEdicao.palavras.map((palavra: string, index: number) => ({
          id: index + 1,
          texto: palavra,
          instrucao: exercicioEdicao.instrucao || `Pratique: ${palavra}`,
        })),
      );
    }
  }, [modoEdicao, exercicioEdicao]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMicStatus("unsupported");
    }

    return () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function convertBlobToWav(blob: Blob): Promise<Blob> {
    const AudioContextConstructor =
      window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextConstructor();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavArrayBuffer = encodeWAV(audioBuffer);
    await audioContext.close();
    return new Blob([wavArrayBuffer], { type: "audio/wav" });
  }

  function encodeWAV(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const samples = audioBuffer.length;
    const blockAlign = numChannels * (bitDepth / 8);
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(offset: number, str: string) {
      for (let i = 0; i < str.length; i += 1) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    let offset = 0;
    writeString(offset, "RIFF");
    offset += 4;
    view.setUint32(offset, 36 + dataSize, true);
    offset += 4;
    writeString(offset, "WAVE");
    offset += 4;
    writeString(offset, "fmt ");
    offset += 4;
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, format, true);
    offset += 2;
    view.setUint16(offset, numChannels, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, byteRate, true);
    offset += 4;
    view.setUint16(offset, blockAlign, true);
    offset += 2;
    view.setUint16(offset, bitDepth, true);
    offset += 2;
    writeString(offset, "data");
    offset += 4;
    view.setUint32(offset, dataSize, true);
    offset += 4;

    const interleaved = interleaveAudio(audioBuffer);
    let index = 44;

    for (let i = 0; i < interleaved.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(
        index,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true,
      );
      index += 2;
    }

    return buffer;
  }

  function interleaveAudio(audioBuffer: AudioBuffer): Float32Array {
    const channels = [];
    const length = audioBuffer.length;
    const numChannels = audioBuffer.numberOfChannels;

    for (let i = 0; i < numChannels; i += 1) {
      channels.push(audioBuffer.getChannelData(i));
    }

    if (numChannels === 1) {
      return channels[0];
    }

    const result = new Float32Array(length * numChannels);
    let offset = 0;

    for (let i = 0; i < length; i += 1) {
      for (let channel = 0; channel < numChannels; channel += 1) {
        result[offset] = channels[channel][i];
        offset += 1;
      }
    }

    return result;
  }

  async function startRecordingForItem(itemId: string | number) {
    if (micStatus === "unsupported" || micStatus === "recording") return;

    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const rawBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const wavBlob = await convertBlobToWav(rawBlob);
        const url = URL.createObjectURL(wavBlob);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        setConteudos((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  audioReferencia: url,
                  audioReferenciaBlob: wavBlob,
                }
              : item,
          ),
        );
        setRecordingItemId(null);
        setMicStatus("recorded");
      };

      recorder.start();
      setRecordingItemId(itemId);
      setMicStatus("recording");
    } catch {
      setMicStatus("error");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  async function uploadAudioReferences(
    exercicioId: string,
    savedConteudos: Array<{ id: string | number }>,
  ) {
    const uploads = conteudos
      .map((item, index) => {
        if (!item.audioReferenciaBlob) {
          return null;
        }

        const serverConteudoId = savedConteudos[index]?.id;

        if (!serverConteudoId) {
          return null;
        }

        return uploadConteudoAudioReferencia(
          exercicioId,
          serverConteudoId,
          item.audioReferenciaBlob,
        );
      })
      .filter(Boolean) as Promise<unknown>[];

    if (uploads.length === 0) {
      return;
    }

    await Promise.all(uploads);
  }

  const getConteudosForPayload = () => {
    const items = [...conteudos];
    const textoAtual = conteudo.trim();

    if (textoAtual) {
      items.push({
        id: Date.now(),
        texto: textoAtual,
        instrucao:
          instrucaoItem.trim() ||
          form.instrucoesGuia.trim() ||
          `Pratique: ${textoAtual}`,
      });
    }

    return items
      .map((item) => ({
        texto: item.texto.trim(),
        instrucao:
          item.instrucao.trim() ||
          form.instrucoesGuia.trim() ||
          `Pratique: ${item.texto.trim()}`,
      }))
      .filter((item) => item.texto);
  };

  const conteudosPreview = useMemo(
    () => getConteudosForPayload(),
    [conteudos, conteudo, instrucaoItem, form.instrucoesGuia],
  );
  const totalConteudos = conteudosPreview.length;

  const palavrasPreview = useMemo(() => {
    return conteudosPreview.map((item) => item.texto).join(", ");
  }, [conteudosPreview]);

  const previewConteudo = palavrasPreview;

  const openAiBox = () => {
    const categoriaContexto = aiPrompt.trim() || newCategory.trim();
    setAiPrompt(categoriaContexto);
    setAiFeedback(null);
    setAiSuggestionText("");
    setShowAiBox(true);
    void handleGenerateWithAI(categoriaContexto);
  };

  const handleAddWord = () => {
    const texto = conteudo.trim();

    if (!texto) {
      setShowErrorModal(true);
      return;
    }

    setConteudos((prev) => [
      ...prev,
      {
        id: Date.now(),
        texto,
        instrucao:
          instrucaoItem.trim() ||
          form.instrucoesGuia.trim() ||
          `Pratique: ${texto}`,
      },
    ]);
    setConteudo("");
    setInstrucaoItem("");
  };

  const handleRemoveWord = (id: string | number) => {
    setConteudos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (!pacienteId) {
      alert(
        "Paciente não identificado. Volte ao paciente e clique em Criar Exercício novamente.",
      );
      return;
    }

    const conteudosValidos = getConteudosForPayload();
    const palavras = conteudosValidos.map((item) => item.texto);

    if (!newCategory.trim() || !form.objetivo.trim() || palavras.length === 0) {
      setShowErrorModal(true);
      return;
    }

    const payload = {
      nome: form.nome.trim() || newCategory.trim(),
      categoria: newCategory.trim(),
      nivel: NIVEL_TO_API[form.nivel],
      objetivo: form.objetivo.trim(),
      instrucao:
        conteudosValidos[0]?.instrucao ||
        form.instrucoesGuia.trim() ||
        "Pratique o conteudo do exercicio.",
      conteudo: palavras.join(", "),
      paciente: [pacienteId],
      palavras,
      conteudos: conteudosValidos,
    };

    try {
      const savedExercise = modoEdicao
        ? await editarExercicio(exercicioEdicao.id, payload)
        : await criarExercicio(payload);

      await uploadAudioReferences(
        savedExercise.id,
        savedExercise.conteudos || [],
      );

      setNewCategory("");
      setConteudo("");
      setInstrucaoItem("");
      setConteudos([]);
      setForm({
        nome: "",
        objetivo: "",
        nivel: "Médio",
        instrucoesGuia: DEFAULT_INSTRUCTIONS,
        ativo: true,
      });

      setShowSuccessModal(true);
    } catch (e) {
      console.error("Erro ao salvar exercício:", e);
      alert(e instanceof Error ? e.message : "Erro ao salvar exercício.");
    }
  };

  const handleGenerateWithAI = async (categoriaOverride?: string) => {
    if (isGeneratingAi) return;

    const categoria = (categoriaOverride || aiPrompt || newCategory).trim();

    if (!categoria) {
      setAiFeedback({
        type: "error",
        message: "Informe uma categoria para gerar a sugestão.",
      });
      return;
    }

    setIsGeneratingAi(true);
    setAiFeedback(null);
    setAiSuggestionText("");

    try {
      const suggestion = await sugerirExercicioComIA({
        categoria,
        nivel: form.nivel,
        objetivo: form.objetivo.trim() || undefined,
      });

      setAiSuggestionText(suggestion.sugestao);
      setAiFeedback({
        type: "success",
        message: "Sugestão gerada com sucesso.",
      });
    } catch (e) {
      console.error("Erro ao gerar sugestão com IA:", e);
      setAiFeedback({
        type: "error",
        message:
          e instanceof Error
            ? e.message
            : "Não foi possível gerar a sugestão agora.",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyAiSuggestion = async () => {
    if (!aiSuggestionText) return;

    try {
      await navigator.clipboard.writeText(aiSuggestionText);
      setAiFeedback({
        type: "success",
        message: "Sugestão copiada.",
      });
    } catch {
      setAiFeedback({
        type: "error",
        message: "Não foi possível copiar a sugestão.",
      });
    }
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl text-center">
            <h2 className="text-lg font-bold text-[#1A2B5F] mb-2">
              Exercício Cadastrado!
            </h2>
            <p className="text-sm text-gray-600 mb-4">Salvo com sucesso!</p>

            <button
              id="btn-ok"
              onClick={() => {
                setShowSuccessModal(false);
              }}
              className="px-4 py-2 rounded-xl text-white cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #0052CC, #0065FF)",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "#fff",
              borderRadius: 28,
              border: "1.5px solid #FECACA",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              padding: 28,
              position: "relative",
            }}
          >
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#1A2B5F",
                marginBottom: 8,
              }}
            >
              Campos obrigatórios
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6B7A99",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              Preencha todos os campos obrigatórios antes de salvar o exercício.
            </p>

            <div className="grid grid-cols-1  justify-items-center">
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  padding: "0 24px",
                  minHeight: 42,
                  borderRadius: 16,
                  border: "none",
                  background: "#EF4444",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                OK!
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="min-h-screen"
        style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
      >
        <div className="w-full overflow-x-hidden">
          <div className="xl:grid xl:min-h-screen xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
            {/* Sidebar desktop grande */}
            <aside
              className="hidden min-w-0 xl:block"
              style={{
                background:
                  "linear-gradient(180deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
              }}
            >
              <div className="sticky top-0 flex h-screen flex-col overflow-y-auto p-5 2xl:p-8">
                <button
                  id="btn-voltar"
                  onClick={() => navigate(-1)}
                  className="mb-6 flex items-center gap-2 transition-all hover:opacity-80"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={20} color="rgba(255,255,255,0.9)" />
                  <span
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}
                  >
                    Voltar
                  </span>
                </button>

                <div
                  className="rounded-[24px] p-5 2xl:rounded-[28px] 2xl:p-6"
                  style={{ background: "rgba(255,255,255,0.14)" }}
                >
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl 2xl:mb-5 2xl:h-16 2xl:w-16"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <Dumbbell size={28} color="#fff" />
                  </div>

                  <h1
                    style={{
                      fontSize: "clamp(22px, 2vw, 28px)",
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.15,
                      wordBreak: "break-word",
                    }}
                  >
                    {modoEdicao ? "Editar Exercício" : "Novo Exercício"}
                  </h1>

                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.78)",
                      marginTop: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    Monte um exercício com conteúdo por item e instrução
                    individual para cada palavra.
                  </p>

                  <div className="mt-8 space-y-3">
                    {[
                      { label: "Categoria", value: newCategory || "-" },
                      { label: "Nível", value: form.nivel },
                      { label: "Itens", value: `${totalConteudos}` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl p-3 2xl:p-4"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#fff",
                            marginTop: 2,
                            wordBreak: "break-word",
                          }}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Conteúdo principal */}
            <main className="min-w-0 overflow-x-hidden">
              {/* Header mobile/tablet */}
              <div
                className="xl:hidden px-4 sm:px-6 md:px-8 pt-10 sm:pt-12 pb-8"
                style={{
                  background:
                    "linear-gradient(150deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
                }}
              >
                <button
                  onClick={() => navigate(-1)}
                  className="mb-6 flex items-center gap-2"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={20} color="rgba(255,255,255,0.9)" />
                  <span
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}
                  >
                    Voltar
                  </span>
                </button>

                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <Dumbbell size={24} color="#fff" />
                  </div>

                  <div className="min-w-0">
                    <h1
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.2,
                      }}
                    >
                      {modoEdicao ? "Editar Exercício" : "Adicionar Exercício"}
                    </h1>
                    <p
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.75)",
                        marginTop: 6,
                        lineHeight: 1.5,
                      }}
                    >
                      Conteúdo por item com instrução individual
                    </p>
                  </div>
                </div>

                {/* Resumo tablet */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Categoria", value: newCategory || "-" },
                    { label: "Nível", value: form.nivel },
                    { label: "Itens", value: `${totalConteudos}` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl p-4"
                      style={{ background: "rgba(255,255,255,0.12)" }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.72)",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#fff",
                          marginTop: 2,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 sm:px-6 md:px-8 xl:px-6 2xl:px-8 pb-8 xl:py-8 2xl:py-10">
                <div className="mx-auto max-w-7xl">
                  {/* Cabeçalho desktop/tablet */}
                  <div className="hidden xl:flex items-center justify-between mb-8 gap-6">
                    <div className="min-w-0">
                      <h2
                        style={{
                          fontSize: 30,
                          fontWeight: 700,
                          color: "#1A2B5F",
                        }}
                      >
                        Cadastrar um exercício para: {patientName}
                      </h2>
                      <p
                        style={{
                          fontSize: 15,
                          color: "#6B7A99",
                          marginTop: 8,
                        }}
                      >
                        Preencha os dados manualmente ou consulte uma sugestão
                        de apoio
                      </p>
                    </div>

                    <button
                      id="btn-ajuda-ia"
                      onClick={openAiBox}
                      disabled={isGeneratingAi}
                      className="shrink-0 rounded-2xl px-5 py-4 flex items-center gap-2 transition-all hover:opacity-90"
                      style={{
                        background: "#EEF4FF",
                        color: "#0052CC",
                        border: "1.5px solid #CFE0FF",
                        cursor: isGeneratingAi ? "not-allowed" : "pointer",
                        opacity: isGeneratingAi ? 0.72 : 1,
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      <Wand2 size={18} />
                      {isGeneratingAi ? "Gerando..." : "Ajuda da IA"}
                    </button>
                  </div>

                  {/* Ação tablet/mobile */}
                  <div className="xl:hidden -mt-4 sm:-mt-6 md:-mt-8 mb-4 sm:mb-5 py-4">
                    <button
                      onClick={openAiBox}
                      disabled={isGeneratingAi}
                      className="w-full sm:w-auto rounded-2xl px-5 py-4 flex items-center justify-center gap-2"
                      style={{
                        background: "#EEF4FF",
                        color: "#0052CC",
                        border: "1.5px solid #CFE0FF",
                        cursor: isGeneratingAi ? "not-allowed" : "pointer",
                        opacity: isGeneratingAi ? 0.72 : 1,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      <Wand2 size={18} />
                      {isGeneratingAi ? "Gerando..." : "Ajuda da IA"}
                    </button>
                  </div>

                  {showAiBox && (
                    <section
                      className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 mb-5 sm:mb-6"
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #DBEAFE",
                        boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                      }}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#1A2B5F",
                            }}
                          >
                            Sugestão da IA
                          </h3>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#6B7A99",
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            Use como referência. Nenhum campo será preenchido
                            automaticamente.
                          </p>
                        </div>

                        <button
                          onClick={() => setShowAiBox(false)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          <X size={18} color="#7B8AAC" />
                        </button>
                      </div>

                      <input
                        id="sugestao-categoria"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Sugira uma Categoria"
                        className="w-full resize-none"
                        style={{
                          ...inputStyle,
                        }}
                      />

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          id="btn-gerar-sugestao"
                          onClick={() => handleGenerateWithAI()}
                          disabled={isGeneratingAi}
                          className="w-full sm:w-auto rounded-2xl px-5 py-3 flex items-center justify-center gap-2"
                          style={{
                            background: "#0052CC",
                            color: "#fff",
                            border: "none",
                            cursor: isGeneratingAi ? "not-allowed" : "pointer",
                            opacity: isGeneratingAi ? 0.72 : 1,
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          <Wand2 size={16} />
                          {isGeneratingAi
                            ? "Gerando..."
                            : aiSuggestionText
                              ? "Gerar novamente"
                              : "Gerar sugestão"}
                        </button>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={handleCopyAiSuggestion}
                            disabled={!aiSuggestionText || isGeneratingAi}
                            className="w-full sm:w-auto rounded-2xl px-5 py-3"
                            style={{
                              background: "#EEF4FF",
                              color: "#0052CC",
                              border: "1.5px solid #CFE0FF",
                              cursor:
                                !aiSuggestionText || isGeneratingAi
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                !aiSuggestionText || isGeneratingAi ? 0.65 : 1,
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            Copiar sugestão
                          </button>

                          <button
                            onClick={() => setShowAiBox(false)}
                            className="w-full sm:w-auto rounded-2xl px-5 py-3"
                            style={{
                              background: "#fff",
                              color: "#4C5B7C",
                              border: "1.5px solid #DBEAFE",
                              cursor: "pointer",
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            Fechar
                          </button>
                        </div>
                      </div>

                      <div
                        className="mt-4 rounded-2xl p-4"
                        style={{
                          background: "#F8FBFF",
                          border: "1.5px solid #E3EEFF",
                          minHeight: 180,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 14,
                            color: "#4C5B7C",
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {isGeneratingAi
                            ? "Gerando sugestão..."
                            : aiSuggestionText ||
                              "Informe uma categoria e clique em Gerar novamente."}
                        </p>
                      </div>
                    </section>
                  )}

                  {aiFeedback && (
                    <div
                      className="mb-5 rounded-2xl px-4 py-3"
                      style={{
                        background:
                          aiFeedback.type === "success" ? "#F0FDF4" : "#FEF2F2",
                        border:
                          aiFeedback.type === "success"
                            ? "1.5px solid #BBF7D0"
                            : "1.5px solid #FECACA",
                        color:
                          aiFeedback.type === "success" ? "#166534" : "#B91C1C",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {aiFeedback.message}
                    </div>
                  )}

                  {/* Layout principal responsivo */}
                  <div className="grid grid-cols-1 gap-5 lg:gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Coluna principal */}
                    <div className="min-w-0 space-y-5 lg:space-y-6">
                      <section
                        className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-8"
                        style={{
                          background: "#fff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                          <div className="md:col-span-2">
                            <Field
                              label="Nome do exercício"
                              icon={<FileText size={16} color="#0052CC" />}
                            >
                              <input
                                id="nome-exercicio"
                                value={form.nome}
                                onChange={(e) =>
                                  updateField("nome", e.target.value)
                                }
                                placeholder="Ex: Treino de pronúncia com frutas"
                                className="w-full"
                                style={inputStyle}
                              />
                            </Field>
                          </div>

                          <Field
                            label="Categoria"
                            icon={<Sparkles size={16} color="#0052CC" />}
                          >
                            <div className="space-y-3">
                              <input
                                id="categoria"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Digite a nova categoria"
                                className="w-full"
                                style={inputStyle}
                              />
                            </div>
                          </Field>

                          <Field
                            label="Nível"
                            icon={<CheckCircle2 size={16} color="#0052CC" />}
                          >
                            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2">
                              {LEVEL_OPTIONS.map((nivel) => {
                                const isActive = form.nivel === nivel;
                                return (
                                  <button
                                    key={nivel}
                                    type="button"
                                    onClick={() => updateField("nivel", nivel)}
                                    className="min-h-[48px] rounded-2xl px-3 py-3 transition-all"
                                    style={{
                                      border: isActive
                                        ? "2px solid #0052CC"
                                        : "1.5px solid #DBEAFE",
                                      background: isActive
                                        ? "#EBF3FF"
                                        : "#F8FBFF",
                                      color: isActive ? "#0052CC" : "#6B7A99",
                                      fontSize: 13,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {nivel}
                                  </button>
                                );
                              })}
                            </div>
                          </Field>

                          <div className="md:col-span-2">
                            <Field
                              label="Objetivo"
                              icon={<Target size={16} color="#0052CC" />}
                            >
                              <input
                                id="objetivo"
                                value={form.objetivo}
                                onChange={(e) =>
                                  updateField("objetivo", e.target.value)
                                }
                                placeholder="Ex: Trabalhar identificação e emissão correta"
                                className="w-full"
                                style={inputStyle}
                              />
                            </Field>
                          </div>
                        </div>
                      </section>

                      <section
                        className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-8"
                        style={{
                          background: "#fff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                        }}
                      >
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div className="min-w-0 w-full">
                            <h3
                              style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#1A2B5F",
                              }}
                            >
                              Conteúdo do exercício
                            </h3>
                            <input
                              id="conteudo"
                              value={conteudo}
                              onChange={(e) => setConteudo(e.target.value)}
                              placeholder="Digite a nova palavra, sílaba ou conteúdo"
                              className="w-full"
                              style={inputStyle}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Field
                            label="Instruções"
                            icon={<FileText size={16} color="#0052CC" />}
                          >
                            <textarea
                              id="instrucoes"
                              rows={5}
                              placeholder="Guia de texto para cada palavra"
                              className="w-full resize-none"
                              value={instrucaoItem}
                              onChange={(e) => setInstrucaoItem(e.target.value)}
                              style={{
                                ...inputStyle,
                                height: "auto",
                                minHeight: 132,
                                paddingTop: 14,
                              }}
                            />
                          </Field>
                        </div>

                        <div className="py-2 flex justify-end">
                          <button
                            onClick={handleAddWord}
                            className="w-full sm:w-auto rounded-2xl px-6 py-4 flex items-center justify-center gap-2"
                            style={{
                              background: "#EBF3FF",
                              color: "#0052CC",
                              border: "1.5px solid #93C5FD",
                              cursor: "pointer",
                              fontSize: 15,
                              fontWeight: 800,
                              minWidth: 220,
                              maxWidth: "100%",
                            }}
                          >
                            <Plus size={18} />
                            Adicionar Palavra
                          </button>
                        </div>
                        {conteudos.length > 0 && (
                          <div className="mt-5 grid gap-3">
                            {conteudos.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-start sm:justify-between"
                                style={{
                                  background: "#F8FBFF",
                                  border: "1.5px solid #DBEAFE",
                                }}
                              >
                                <div className="min-w-0">
                                  <p
                                    style={{
                                      color: "#0052CC",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      marginBottom: 4,
                                    }}
                                  >
                                    Palavra {index + 1}
                                  </p>
                                  <p
                                    style={{
                                      color: "#1A2B5F",
                                      fontSize: 16,
                                      fontWeight: 800,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {item.texto}
                                  </p>
                                  <p
                                    style={{
                                      color: "#6B7A99",
                                      fontSize: 13,
                                      lineHeight: 1.5,
                                      marginTop: 6,
                                      whiteSpace: "pre-wrap",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {item.instrucao}
                                  </p>

                                  {item.audioReferencia && (
                                    <div className="mt-3">
                                      <audio
                                        controls
                                        src={item.audioReferencia}
                                        className="w-full rounded-2xl"
                                      />
                                    </div>
                                  )}

                                  {/* Botão para gravar áudio de referência */}
                                  <button
                                    id={`btn-audio-referencia-${item.id}`}
                                    onClick={() => {
                                      if (
                                        recordingItemId === item.id &&
                                        micStatus === "recording"
                                      ) {
                                        stopRecording();
                                      } else {
                                        void startRecordingForItem(item.id);
                                      }
                                    }}
                                    disabled={micStatus === "unsupported"}
                                    className="mt-3 flex items-center gap-2 rounded-2xl px-4 py-3"
                                    style={{
                                      background:
                                        micStatus === "unsupported"
                                          ? "#CBD5E1"
                                          : recordingItemId === item.id &&
                                              micStatus === "recording"
                                            ? "#FF5630"
                                            : "#0052CC",
                                      color: "#fff",
                                      border: "none",
                                      cursor:
                                        micStatus === "unsupported"
                                          ? "not-allowed"
                                          : "pointer",
                                      fontSize: 14,
                                      fontWeight: 700,
                                      width: "fit-content",
                                    }}
                                  >
                                    <Mic size={16} />
                                    {recordingItemId === item.id &&
                                    micStatus === "recording"
                                      ? "Parar gravação"
                                      : item.audioReferencia
                                        ? "Regravar áudio de referência"
                                        : "Gravar áudio de referência"}
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleRemoveWord(item.id)}
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                                  style={{
                                    background: "#FFF0EC",
                                    border: "1px solid #FECDC3",
                                    color: "#FF5630",
                                    cursor: "pointer",
                                  }}
                                  aria-label={`Remover ${item.texto}`}
                                  title="Remover palavra"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                          <button
                            id="btn-salvar-exercicio"
                            onClick={handleSave}
                            className="w-full sm:w-auto rounded-2xl px-6 py-4 flex items-center justify-center gap-2"
                            style={{
                              background: "#007200",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 15,
                              fontWeight: 700,
                              boxShadow: "0 12px 28px rgba(54,179,126,0.22)",
                              minWidth: 220,
                              maxWidth: "100%",
                            }}
                          >
                            <Save size={18} />
                            {modoEdicao
                              ? "Salvar Alterações"
                              : "Salvar Exercício"}
                          </button>
                        </div>
                      </section>
                    </div>

                    {/* Preview */}
                    <aside className="min-w-0">
                      <div
                        className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 2xl:sticky 2xl:top-8"
                        style={{
                          background: "#fff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#1A2B5F",
                            marginBottom: 16,
                          }}
                        >
                          Pré-visualização
                        </h3>

                        <div
                          className="rounded-3xl p-5"
                          style={{
                            background:
                              "linear-gradient(135deg, #0052CC, #0065FF)",
                            color: "#fff",
                          }}
                        >
                          <p style={{ fontSize: 12, opacity: 0.75 }}>Nome</p>
                          <h4
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              marginTop: 4,
                              wordBreak: "break-word",
                            }}
                          >
                            {form.nome || "Novo exercício"}
                          </h4>

                          <div className="mt-5 space-y-3">
                            <PreviewItem
                              label="Categoria"
                              value={newCategory || "-"}
                            />
                            <PreviewItem
                              label="Objetivo"
                              value={form.objetivo || "-"}
                            />
                            <PreviewItem label="Nível" value={form.nivel} />
                            <PreviewItem
                              label="Itens"
                              value={`${totalConteudos}`}
                            />
                          </div>
                        </div>

                        <div className="mt-5">
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#1A2B5F",
                              marginBottom: 10,
                            }}
                          >
                            Resumo do conteúdo
                          </p>

                          <div
                            className="rounded-2xl p-4"
                            style={{
                              background: "#F8FBFF",
                              border: "1.5px solid #E3EEFF",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13,
                                color: "#4C5B7C",
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.6,
                                wordBreak: "break-word",
                              }}
                            >
                              {previewConteudo ||
                                "Nenhum conteúdo informado ainda."}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#1A2B5F",
                              marginBottom: 10,
                            }}
                          >
                            Guia de instruções
                          </p>

                          <div
                            className="rounded-2xl p-4"
                            style={{
                              background: "#F8FBFF",
                              border: "1.5px solid #E3EEFF",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13,
                                color: "#4C5B7C",
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.7,
                                wordBreak: "break-word",
                              }}
                            >
                              {form.instrucoesGuia}
                            </p>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        className="mb-2 flex items-center gap-2"
        style={{ fontSize: 13, fontWeight: 600, color: "#1A2B5F" }}
      >
        {icon}
        <span className="min-w-0 break-words">{label}</span>
      </label>
      {children}
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: "rgba(255,255,255,0.12)" }}
    >
      <p style={{ fontSize: 11, opacity: 0.72 }}>{label}</p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          marginTop: 2,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  borderRadius: 16,
  border: "1.5px solid #DBEAFE",
  background: "#F8FBFF",
  padding: "0 16px",
  fontFamily: "'Poppins', sans-serif",
  fontSize: 14,
  color: "#1A2B5F",
  outline: "none",
};

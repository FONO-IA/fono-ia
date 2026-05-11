import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
  Mic,
  Play,
  Send,
  Square,
  Volume2,
} from "lucide-react";
import { motion } from "motion/react";
import { MobileWrapper } from "./MobileWrapper";
import {
  buscarExercicioPorId,
  enviarRespostaExercicio,
  type Exercicio,
} from "../services/exercicios";
import { getValidAuthSession } from "../services/session";

type MicStatus = "unsupported" | "idle" | "recording" | "recorded" | "error";
type VoiceMatchStatus = "idle" | "listening" | "correct" | "incorrect";

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string; confidence?: number } | undefined;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult;
  };
};

type PracticeItem = {
  id: string;
  text: string;
  instruction: string;
  dicaVisualUrl?: string | null;
  audioUrl?: string | null;
  feedback?: Record<string, unknown> | null;
};

const MIN_RECOGNITION_CONFIDENCE = 0.9;

function getExerciseTitle(exercise: Exercicio) {
  return exercise.titulo?.trim() || exercise.categoria || "Exercicio";
}

function getExerciseDescription(exercise: Exercicio) {
  return (
    exercise.descricao?.trim() ||
    exercise.objetivo?.trim() ||
    exercise.instrucao?.trim() ||
    "Sem descricao cadastrada."
  );
}

function splitExerciseWords(conteudo: string) {
  return conteudo
    .split(/[,;\n\r]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function buildPracticeItems(exercise: Exercicio): PracticeItem[] {
  if (exercise.conteudos?.length) {
    return exercise.conteudos.map((item) => ({
      id: String(item.id),
      text: item.texto,
      instruction: item.instrucao || exercise.instrucao,
      dicaVisualUrl: item.dica_visual_url || item.dica_visual || null,
      audioUrl: item.audio_url || null,
      feedback: item.feedback || null,
    }));
  }

  const words = splitExerciseWords(exercise.conteudo || "");

  if (words.length) {
    return words.map((word, index) => ({
      id: `${exercise.id}-${index}`,
      text: word,
      instruction: exercise.instrucao || "Leia e grave sua resposta.",
    }));
  }

  return [
    {
      id: String(exercise.id),
      text: exercise.conteudo || getExerciseTitle(exercise),
      instruction: exercise.instrucao || "Leia e grave sua resposta.",
    },
  ];
}

function getMicMessage(status: MicStatus) {
  switch (status) {
    case "unsupported":
      return "Este navegador nao oferece captura de audio e reconhecimento de voz.";
    case "recording":
      return "Gravando. Fale com calma e pare quando terminar.";
    case "recorded":
      return "Gravacao finalizada. Voce pode ouvir antes de enviar.";
    case "error":
      return "Nao foi possivel acessar o microfone.";
    default:
      return "Microfone disponivel. Clique para iniciar a gravacao.";
  }
}

function getAudioContextConstructor() {
  return (
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

function getSpeechRecognitionConstructor() {
  const speechWindow = window as Window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
}

function normalizeSpeech(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function transcriptContainsExactTarget(expected: string, transcript: string) {
  if (!expected || !transcript) return 0;
  const expectedWords = expected.split(" ");
  const transcriptWords = transcript.split(" ");

  if (expectedWords.length === 1) {
    return transcriptWords.includes(expectedWords[0]) ? 1 : 0;
  }

  for (let index = 0; index <= transcriptWords.length - expectedWords.length; index += 1) {
    const phrase = transcriptWords
      .slice(index, index + expectedWords.length)
      .join(" ");

    if (phrase === expected) {
      return 1;
    }
  }

  return 0;
}

function encodeWav(buffers: Float32Array[], sampleRate: number) {
  const length = buffers.reduce((total, buffer) => total + buffer.length, 0);
  const samples = new Float32Array(length);
  let offset = 0;

  buffers.forEach((buffer) => {
    samples.set(buffer, offset);
    offset += buffer.length;
  });

  const dataLength = samples.length * 2;
  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);
  floatTo16BitPcm(view, 44, samples);

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function floatTo16BitPcm(view: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
}

export function ChildExercise() {
  const navigate = useNavigate();
  const location = useLocation();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const session = getValidAuthSession();
  const isProfessional = session?.role === "profissional";
  const pacienteId = location.state?.pacienteId
    ? String(location.state.pacienteId)
    : undefined;
  const origem = location.state?.origem;

  const [exercise, setExercise] = useState<Exercicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [micError, setMicError] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceMatch, setVoiceMatch] = useState<VoiceMatchStatus>("idle");
  const [voiceScore, setVoiceScore] = useState(0);
  const [voiceConfidence, setVoiceConfidence] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [savedAudioUrl, setSavedAudioUrl] = useState("");
  const [serverFeedback, setServerFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [completed, setCompleted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioBuffersRef = useRef<Float32Array[]>([]);
  const transcriptRef = useRef("");
  const liveTranscriptRef = useRef("");
  const recognitionConfidenceRef = useRef(0);
  const sampleRateRef = useRef(44100);

  const items = useMemo(
    () => (exercise ? buildPracticeItems(exercise) : []),
    [exercise],
  );
  const currentItem = items[currentIndex];
  const latestSavedAudio = savedAudioUrl || exercise?.audio_url || "";
  const currentSavedAudio =
    currentItem?.audioUrl || (items.length <= 1 ? latestSavedAudio : "");

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || !getAudioContextConstructor()) {
      setMicStatus("unsupported");
    }

    setSpeechSupported(Boolean(getSpeechRecognitionConstructor()));
  }, []);

  useEffect(() => {
    async function loadExercise() {
      if (!exerciseId) {
        setError("Exercicio nao identificado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await buscarExercicioPorId(exerciseId, pacienteId);
        setExercise(data);
        setSavedAudioUrl(data.audio_url || "");
        setCurrentIndex(0);
        setCompleted(Boolean(data.concluido));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Nao foi possivel carregar o exercicio.";

        setError(
          message.toLowerCase().includes("permiss")
            ? "Voce nao tem permissao para acessar este exercicio."
            : message,
        );
      } finally {
        setLoading(false);
      }
    }

    void loadExercise();
  }, [exerciseId, pacienteId]);

  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      releaseAudioResources();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  function clearRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    stopSpeechRecognition();
    releaseAudioResources();
    setAudioUrl("");
    setAudioBlob(null);
    setLiveTranscript("");
    setVoiceMatch("idle");
    setVoiceScore(0);
    setVoiceConfidence(0);
    setServerFeedback("");
    transcriptRef.current = "";
    liveTranscriptRef.current = "";
    recognitionConfidenceRef.current = 0;
    audioBuffersRef.current = [];
    if (micStatus !== "unsupported") {
      setMicStatus("idle");
    }
  }

  function releaseAudioResources() {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;

    if (audioContextRef.current?.state !== "closed") {
      void audioContextRef.current?.close();
    }

    audioContextRef.current = null;
  }

  function stopSpeechRecognition() {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;

    if (recognition) {
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped by the browser.
      }
    }
  }

  function evaluateTranscript(transcript: string, confidence = recognitionConfidenceRef.current) {
    const expected = normalizeSpeech(currentItem?.text || "");
    const spoken = normalizeSpeech(transcript);
    const score = transcriptContainsExactTarget(expected, spoken);
    const hasConfidence = confidence > 0;
    const isCorrect =
      score === 1 &&
      (!hasConfidence || confidence >= MIN_RECOGNITION_CONFIDENCE);

    setVoiceScore(score);
    setVoiceConfidence(confidence);
    setVoiceMatch(
      !spoken ? "listening" : isCorrect ? "correct" : "incorrect",
    );
  }

  function startSpeechRecognition() {
    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    transcriptRef.current = "";
    recognitionConfidenceRef.current = 0;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalConfidence = recognitionConfidenceRef.current;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || "";

        if (result.isFinal) {
          transcriptRef.current = `${transcriptRef.current} ${transcript}`.trim();
          finalConfidence = Math.max(
            finalConfidence,
            result[0]?.confidence || 0,
          );
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      recognitionConfidenceRef.current = finalConfidence;
      const fullTranscript =
        `${transcriptRef.current} ${interimTranscript}`.trim();
      liveTranscriptRef.current = fullTranscript;
      setLiveTranscript(fullTranscript);
      evaluateTranscript(fullTranscript, finalConfidence);
    };

    recognition.onerror = () => {
      setSpeechSupported(false);
    };

    recognition.start();
  }

  async function startRecording() {
    if (micStatus === "unsupported" || micStatus === "recording") return;

    try {
      setMicError("");
      setSubmitError("");
      setServerFeedback("");
      clearRecording();

      const AudioContextConstructor = getAudioContextConstructor();
      if (!AudioContextConstructor) {
        setMicStatus("unsupported");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContextConstructor();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      audioContextRef.current = audioContext;
      sourceRef.current = source;
      processorRef.current = processor;
      audioBuffersRef.current = [];
      sampleRateRef.current = audioContext.sampleRate;

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        audioBuffersRef.current.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      startSpeechRecognition();
      setVoiceMatch("listening");
      setMicStatus("recording");
    } catch {
      setMicStatus("error");
      setMicError(
        "Permita o acesso ao microfone no navegador para gravar sua resposta.",
      );
    }
  }

  function stopRecording() {
    if (micStatus !== "recording") return;

    stopSpeechRecognition();
    releaseAudioResources();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (!audioBuffersRef.current.length) {
      setMicStatus("error");
      setMicError("Nao foi possivel capturar audio. Tente novamente.");
      return;
    }

    const blob = encodeWav(audioBuffersRef.current, sampleRateRef.current);
    const url = URL.createObjectURL(blob);

    setAudioBlob(blob);
    setAudioUrl(url);
    setMicStatus("recorded");
    evaluateTranscript(
      liveTranscriptRef.current || transcriptRef.current,
      recognitionConfidenceRef.current,
    );
  }

  async function submitAnswer() {
    if (!exerciseId || !audioBlob) return;

    if (isProfessional) {
      setCompleted(true);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      const transcricao = liveTranscriptRef.current || liveTranscript;
      const correto = voiceMatch === "correct";
      const response = await enviarRespostaExercicio(
        exerciseId,
        audioBlob,
        pacienteId,
        {
          palavraAlvo: currentItem.text,
          transcricao,
          correto,
          similaridade: voiceScore,
          confianca: voiceConfidence,
          conteudoId: currentItem.id,
        },
      );

      setCompleted(response.concluido);
      if (response.audio_url) {
        setSavedAudioUrl(response.audio_url);
        setExercise((prev) =>
          prev
            ? {
                ...prev,
                audio_url: response.audio_url,
                conteudos: prev.conteudos?.map((item) =>
                  String(item.id) === currentItem.id
                    ? {
                        ...item,
                        audio_url: response.audio_url,
                        feedback: response.feedback,
                      }
                    : item,
                ),
              }
            : prev,
        );
      }
      setServerFeedback(
        response.feedback?.correto === true
          ? "Resposta correta registrada com sucesso."
          : "Resposta registrada. A palavra alvo ainda nao foi reconhecida como correta.",
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel enviar a resposta.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if ((origem === "fono" || isProfessional) && pacienteId) {
      navigate(`/patient/${pacienteId}`);
      return;
    }

    if (isProfessional) {
      navigate("/admin");
      return;
    }

    navigate("/child/home");
  }

  function goToItem(nextIndex: number) {
    setCurrentIndex(nextIndex);
    clearRecording();
    setSubmitError("");
  }

  if (loading) {
    return (
      <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
        >
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin" size={28} color="#0052CC" />
            <span style={{ color: "#1A2B5F", fontWeight: 700 }}>
              Carregando exercicio...
            </span>
          </div>
        </div>
      </MobileWrapper>
    );
  }

  if (error || !exercise || !currentItem) {
    return (
      <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
        <div
          className="flex min-h-screen items-center justify-center px-5"
          style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 text-center"
            style={{ background: "#fff", border: "1.5px solid #DBEAFE" }}
          >
            <AlertCircle className="mx-auto mb-4" size={34} color="#FF5630" />
            <h1 style={{ color: "#1A2B5F", fontSize: 22, fontWeight: 800 }}>
              Exercicio indisponivel
            </h1>
            <p style={{ color: "#6B7A99", fontSize: 14, marginTop: 8 }}>
              {error || "Nao encontramos dados para este exercicio."}
            </p>
            <button
              onClick={handleBack}
              className="mt-5 rounded-2xl px-5 py-3"
              style={{
                background: "#0052CC",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Voltar
            </button>
          </div>
        </div>
      </MobileWrapper>
    );
  }

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="min-h-screen"
        style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
      >
        <header
          className="px-5 py-5 md:px-10"
          style={{ background: "#fff", borderBottom: "1px solid #DBEAFE" }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={handleBack}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: "#F4F7FF",
                  border: "2px solid #DBEAFE",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={20} color="#0052CC" />
              </button>
              <div className="min-w-0">
                <p style={{ color: "#0052CC", fontSize: 12, fontWeight: 800 }}>
                  {exercise.categoria} {exercise.nivel_display ? `- ${exercise.nivel_display}` : ""}
                </p>
                <h1
                  className="truncate"
                  style={{ color: "#1A2B5F", fontSize: 22, fontWeight: 800 }}
                >
                  {getExerciseTitle(exercise)}
                </h1>
              </div>
            </div>

            {(isProfessional || completed) && (
              <div
                className="hidden items-center gap-2 rounded-2xl px-4 py-2 md:flex"
                style={{
                  background: completed ? "#ECFDF5" : "#EBF3FF",
                  color: completed ? "#1F8A5B" : "#0052CC",
                }}
              >
                <CheckCircle2 size={18} />
                <span style={{ fontSize: 13, fontWeight: 800 }}>
                  {completed
                    ? "Concluido"
                    : "Modo teste do fonoaudiologo"}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-5 py-6 md:grid-cols-[340px_minmax(0,1fr)] md:px-10 md:py-8">
          <aside
            className="rounded-3xl p-5 md:sticky md:top-6 md:self-start"
            style={{
              background: "#fff",
              border: "1.5px solid #DBEAFE",
              boxShadow: "0 6px 24px rgba(0,82,204,0.06)",
            }}
          >
            <p style={{ color: "#6B7A99", fontSize: 12, fontWeight: 800 }}>
              DESCRICAO
            </p>
            <p
              style={{
                color: "#1A2B5F",
                fontSize: 15,
                lineHeight: 1.6,
                marginTop: 8,
              }}
            >
              {getExerciseDescription(exercise)}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoPill label="Categoria" value={exercise.categoria || "-"} />
              <InfoPill
                label="Nivel"
                value={exercise.nivel_display || exercise.nivel || "-"}
              />
            </div>

            {items.length <= 1 && currentSavedAudio && (
              <div className="mt-5 rounded-2xl p-4" style={{ background: "#F8FBFF" }}>
                <div className="mb-3 flex items-center gap-2">
                  <Volume2 size={17} color="#0052CC" />
                  <p style={{ color: "#1A2B5F", fontSize: 13, fontWeight: 800 }}>
                    Gravacao da palavra
                  </p>
                </div>
                <audio controls src={currentSavedAudio} className="w-full" />
              </div>
            )}

            {items.length > 1 && (
              <div className="mt-5">
                <p style={{ color: "#6B7A99", fontSize: 12, fontWeight: 800 }}>
                  ITENS
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl p-2"
                      style={{
                        background: index === currentIndex ? "#EBF3FF" : "#F8FBFF",
                        border:
                          index === currentIndex
                            ? "1.5px solid #93C5FD"
                            : "1.5px solid #E3EEFF",
                      }}
                    >
                      <button
                        onClick={() => goToItem(index)}
                        className="w-full rounded-xl px-2 py-2 text-left"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#1A2B5F",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {index + 1}. {item.text}
                      </button>
                      {item.audioUrl && (
                        <div className="px-2 pb-2">
                          <p
                            style={{
                              color: "#6B7A99",
                              fontSize: 11,
                              fontWeight: 800,
                              marginBottom: 6,
                            }}
                          >
                            Gravacao desta palavra
                          </p>
                          <audio controls src={item.audioUrl} className="w-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="flex flex-col gap-5">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6 md:p-8"
              style={{
                background: "#fff",
                border: "1.5px solid #DBEAFE",
                boxShadow: "0 6px 24px rgba(0,82,204,0.06)",
              }}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p style={{ color: "#6B7A99", fontSize: 12, fontWeight: 800 }}>
                    PRATIQUE
                  </p>
                  <p style={{ color: "#0052CC", fontSize: 13, fontWeight: 700 }}>
                    Item {currentIndex + 1} de {items.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToItem(Math.max(currentIndex - 1, 0))}
                    disabled={currentIndex === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{
                      background: "#F4F7FF",
                      border: "1.5px solid #DBEAFE",
                      opacity: currentIndex === 0 ? 0.45 : 1,
                      cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={18} color="#0052CC" />
                  </button>
                  <button
                    onClick={() =>
                      goToItem(Math.min(currentIndex + 1, items.length - 1))
                    }
                    disabled={currentIndex === items.length - 1}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{
                      background: "#F4F7FF",
                      border: "1.5px solid #DBEAFE",
                      opacity: currentIndex === items.length - 1 ? 0.45 : 1,
                      cursor:
                        currentIndex === items.length - 1
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <ChevronRight size={18} color="#0052CC" />
                  </button>
                </div>
              </div>

              <div
                className="rounded-3xl p-6 text-center"
                style={{ background: "#EBF3FF", border: "1.5px solid #DBEAFE" }}
              >
                {currentItem.dicaVisualUrl && (
                  <img
                    src={currentItem.dicaVisualUrl}
                    alt={`Dica visual de ${currentItem.text}`}
                    className="mx-auto mb-5 max-h-56 w-full max-w-sm rounded-3xl object-contain"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #DBEAFE",
                    }}
                  />
                )}
                <p
                  style={{
                    color: "#1A2B5F",
                    fontSize: "clamp(34px, 6vw, 58px)",
                    fontWeight: 900,
                    lineHeight: 1.1,
                    wordBreak: "break-word",
                  }}
                >
                  {currentItem.text}
                </p>
                <p
                  className="mx-auto mt-4 max-w-2xl"
                  style={{ color: "#4F5D7A", fontSize: 15, lineHeight: 1.6 }}
                >
                  {currentItem.instruction}
                </p>
              </div>
            </motion.div>

            <div
              className="rounded-3xl p-6 md:p-8"
              style={{
                background: "#fff",
                border: "1.5px solid #DBEAFE",
                boxShadow: "0 6px 24px rgba(0,82,204,0.06)",
              }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p style={{ color: "#1A2B5F", fontSize: 18, fontWeight: 800 }}>
                    {isProfessional ? "Teste a gravacao" : "Grave sua resposta"}
                  </p>
                  <p style={{ color: "#6B7A99", fontSize: 14, marginTop: 4 }}>
                    {getMicMessage(micStatus)}
                  </p>
                </div>
                <div
                  className="rounded-2xl px-3 py-2"
                  style={{
                    background:
                      micStatus === "recording"
                        ? "#FFF0EC"
                        : micStatus === "recorded"
                          ? "#ECFDF5"
                          : "#EBF3FF",
                    color:
                      micStatus === "recording"
                        ? "#FF5630"
                        : micStatus === "recorded"
                          ? "#1F8A5B"
                          : "#0052CC",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {micStatus === "recording"
                    ? "Gravando"
                    : micStatus === "recorded"
                      ? "Finalizada"
                      : "Aguardando"}
                </div>
              </div>

              {(micError || submitError) && (
                <div
                  className="mb-5 flex items-start gap-2 rounded-2xl p-4"
                  style={{
                    background: "#FFF0EC",
                    border: "1.5px solid #FECDC3",
                    color: "#9A3412",
                  }}
                >
                  <AlertCircle size={18} />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>
                    {micError || submitError}
                  </p>
                </div>
              )}

              <div
                className="mb-5 rounded-2xl p-4"
                style={{
                  background:
                    voiceMatch === "correct"
                      ? "#ECFDF5"
                      : voiceMatch === "incorrect"
                        ? "#FFF7ED"
                        : "#F8FBFF",
                  border:
                    voiceMatch === "correct"
                      ? "1.5px solid #BBF7D0"
                      : voiceMatch === "incorrect"
                        ? "1.5px solid #FED7AA"
                        : "1.5px solid #E3EEFF",
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p style={{ color: "#6B7A99", fontSize: 12, fontWeight: 800 }}>
                      PALAVRA ALVO
                    </p>
                    <p style={{ color: "#1A2B5F", fontSize: 18, fontWeight: 900 }}>
                      {currentItem.text}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl px-3 py-2"
                    style={{
                      background:
                        voiceMatch === "correct" ? "#D1FAE5" : "#EBF3FF",
                      color:
                        voiceMatch === "correct" ? "#047857" : "#0052CC",
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    {voiceMatch === "correct"
                      ? "Correto"
                      : voiceMatch === "incorrect"
                        ? "Tentando reconhecer"
                        : "Aguardando voz"}
                  </div>
                </div>

                <div className="mt-4">
                  <p style={{ color: "#6B7A99", fontSize: 12, fontWeight: 800 }}>
                    RECONHECIMENTO EM TEMPO REAL
                  </p>
                  <p
                    style={{
                      color: "#4C5B7C",
                      fontSize: 14,
                      lineHeight: 1.6,
                      marginTop: 6,
                      wordBreak: "break-word",
                    }}
                  >
                    {!speechSupported
                      ? "Reconhecimento de voz indisponivel neste navegador."
                      : liveTranscript || "A fala reconhecida aparecera aqui."}
                  </p>
                  {voiceScore > 0 && (
                    <p
                      style={{
                        color: "#6B7A99",
                        fontSize: 12,
                        fontWeight: 700,
                        marginTop: 8,
                      }}
                    >
                      Precisao textual: {Math.round(voiceScore * 100)}%
                      {voiceConfidence > 0
                        ? ` · Confianca: ${Math.round(voiceConfidence * 100)}%`
                        : ""}
                    </p>
                  )}
                  <p
                    style={{
                      color: "#6B7A99",
                      fontSize: 12,
                      lineHeight: 1.5,
                      marginTop: 8,
                    }}
                  >
                    Validacao estrita: a palavra precisa ser reconhecida igual
                    ao alvo{voiceConfidence > 0 ? " e com confianca alta" : ""}.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                {micStatus === "recording" ? (
                  <button
                    onClick={stopRecording}
                    className="flex items-center justify-center gap-2 rounded-3xl px-6 py-4"
                    style={{
                      background: "#FF5630",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 15,
                      fontWeight: 800,
                    }}
                  >
                    <Square size={18} fill="#fff" />
                    Parar gravacao
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    disabled={micStatus === "unsupported" || submitting}
                    className="flex items-center justify-center gap-2 rounded-3xl px-6 py-4"
                    style={{
                      background:
                        micStatus === "unsupported" ? "#CBD5E1" : "#0052CC",
                      color: "#fff",
                      border: "none",
                      cursor:
                        micStatus === "unsupported" || submitting
                          ? "not-allowed"
                          : "pointer",
                      fontSize: 15,
                      fontWeight: 800,
                    }}
                  >
                    <Mic size={18} />
                    {audioBlob ? "Gravar novamente" : "Iniciar gravacao"}
                  </button>
                )}

                <button
                  onClick={submitAnswer}
                  disabled={!audioBlob || submitting}
                  className="flex items-center justify-center gap-2 rounded-3xl px-6 py-4"
                  style={{
                    background: !audioBlob ? "#DBEAFE" : "#0A8F3D",
                    color: !audioBlob ? "#6B7A99" : "#fff",
                    border: "none",
                    cursor: !audioBlob || submitting ? "not-allowed" : "pointer",
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  {submitting
                    ? "Enviando..."
                    : isProfessional
                      ? "Finalizar teste"
                      : "Enviar resposta"}
                </button>
              </div>

              {serverFeedback && (
                <div
                  className="mt-5 rounded-2xl p-4"
                  style={{
                    background: completed ? "#ECFDF5" : "#FFF7ED",
                    border: completed
                      ? "1.5px solid #BBF7D0"
                      : "1.5px solid #FED7AA",
                    color: completed ? "#1F8A5B" : "#9A3412",
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 800 }}>
                    {serverFeedback}
                  </p>
                </div>
              )}

              {isProfessional && (
                <div
                  className="mt-5 rounded-2xl p-4"
                  style={{ background: "#EBF3FF", border: "1.5px solid #DBEAFE" }}
                >
                  <p style={{ color: "#1A2B5F", fontSize: 13, fontWeight: 700 }}>
                    Voce esta visualizando este exercicio como fonoaudiologo.
                    A gravacao fica local nesta tela e nao altera o progresso
                    do paciente.
                  </p>
                </div>
              )}

              {currentSavedAudio && (
                <div className="mt-5 rounded-2xl p-4" style={{ background: "#F8FBFF" }}>
                  <div className="mb-3 flex items-center gap-2">
                    <Volume2 size={16} color="#0052CC" />
                    <p style={{ color: "#1A2B5F", fontSize: 13, fontWeight: 800 }}>
                      Gravacao salva desta palavra
                    </p>
                  </div>
                  <audio controls src={currentSavedAudio} className="w-full" />
                </div>
              )}

              {audioUrl && (
                <div className="mt-5 rounded-2xl p-4" style={{ background: "#F8FBFF" }}>
                  <div className="mb-3 flex items-center gap-2">
                    <Play size={16} color="#0052CC" />
                    <p style={{ color: "#1A2B5F", fontSize: 13, fontWeight: 800 }}>
                      Ouvir gravacao
                    </p>
                  </div>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}

              {completed && (
                <div
                  className="mt-5 rounded-3xl p-5"
                  style={{ background: "#ECFDF5", border: "1.5px solid #BBF7D0" }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={26} color="#1F8A5B" />
                    <div>
                      <p style={{ color: "#1F8A5B", fontSize: 17, fontWeight: 900 }}>
                        Exercicio concluido
                      </p>
                      <p style={{ color: "#357A5B", fontSize: 13, marginTop: 3 }}>
                        {isProfessional
                          ? "Teste local finalizado sem alterar o progresso do paciente."
                          : "A resposta foi registrada para acompanhamento do progresso."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBack}
                    className="mt-4 flex items-center gap-2 rounded-2xl px-5 py-3"
                    style={{
                      background: "#fff",
                      color: "#1F8A5B",
                      border: "1.5px solid #BBF7D0",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    <Home size={17} />
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </MobileWrapper>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: "#F8FBFF", border: "1.5px solid #E3EEFF" }}
    >
      <p style={{ color: "#6B7A99", fontSize: 11, fontWeight: 700 }}>
        {label}
      </p>
      <p
        style={{
          color: "#1A2B5F",
          fontSize: 13,
          fontWeight: 800,
          marginTop: 3,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
    </div>
  );
}

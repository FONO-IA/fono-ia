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

type MicStatus = "unsupported" | "idle" | "recording" | "recorded" | "error";

type PracticeItem = {
  id: string;
  text: string;
  instruction: string;
};

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

function buildPracticeItems(exercise: Exercicio): PracticeItem[] {
  if (exercise.conteudos?.length) {
    return exercise.conteudos.map((item) => ({
      id: String(item.id),
      text: item.texto,
      instruction: item.instrucao || exercise.instrucao,
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
      return "Este navegador nao oferece gravacao de audio.";
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

export function ChildExercise() {
  const navigate = useNavigate();
  const location = useLocation();
  const { exerciseId } = useParams<{ exerciseId: string }>();
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [completed, setCompleted] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const items = useMemo(
    () => (exercise ? buildPracticeItems(exercise) : []),
    [exercise],
  );
  const currentItem = items[currentIndex];
  const referenceAudio = exercise?.audio_url || exercise?.referencia_url;

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMicStatus("unsupported");
    }
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
        const data = await buscarExercicioPorId(exerciseId);
        setExercise(data);
        setCurrentIndex(0);
        setCompleted(Boolean(data.concluido));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Nao foi possivel carregar o exercicio.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadExercise();
  }, [exerciseId]);

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
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
    setAudioUrl("");
    setAudioBlob(null);
    chunksRef.current = [];
    if (micStatus !== "unsupported") {
      setMicStatus("idle");
    }
  }

  async function startRecording() {
    if (micStatus === "unsupported" || micStatus === "recording") return;

    try {
      setMicError("");
      setSubmitError("");
      clearRecording();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setAudioBlob(blob);
        setAudioUrl(url);
        setMicStatus("recorded");
      };

      recorder.start();
      setMicStatus("recording");
    } catch {
      setMicStatus("error");
      setMicError(
        "Permita o acesso ao microfone no navegador para gravar sua resposta.",
      );
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  async function submitAnswer() {
    if (!exerciseId || !audioBlob) return;

    try {
      setSubmitting(true);
      setSubmitError("");
      await enviarRespostaExercicio(exerciseId, audioBlob, pacienteId);
      setCompleted(true);
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
    if (origem === "fono" && pacienteId) {
      navigate(`/patient/${pacienteId}`);
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

            {completed && (
              <div
                className="hidden items-center gap-2 rounded-2xl px-4 py-2 md:flex"
                style={{ background: "#ECFDF5", color: "#1F8A5B" }}
              >
                <CheckCircle2 size={18} />
                <span style={{ fontSize: 13, fontWeight: 800 }}>
                  Concluido
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

            {referenceAudio && (
              <div className="mt-5 rounded-2xl p-4" style={{ background: "#F8FBFF" }}>
                <div className="mb-3 flex items-center gap-2">
                  <Volume2 size={17} color="#0052CC" />
                  <p style={{ color: "#1A2B5F", fontSize: 13, fontWeight: 800 }}>
                    Audio de referencia
                  </p>
                </div>
                <audio controls src={referenceAudio} className="w-full" />
              </div>
            )}

            {items.length > 1 && (
              <div className="mt-5">
                <p style={{ color: "#6B7A99", fontSize: 12, fontWeight: 800 }}>
                  ITENS
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => goToItem(index)}
                      className="rounded-2xl px-3 py-3 text-left"
                      style={{
                        background: index === currentIndex ? "#EBF3FF" : "#F8FBFF",
                        border:
                          index === currentIndex
                            ? "1.5px solid #93C5FD"
                            : "1.5px solid #E3EEFF",
                        color: "#1A2B5F",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}. {item.text}
                    </button>
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
                    Grave sua resposta
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
                  {submitting ? "Enviando..." : "Enviar resposta"}
                </button>
              </div>

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
                        A resposta foi registrada para acompanhamento do progresso.
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

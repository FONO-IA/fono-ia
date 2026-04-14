import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { Home, Volume2, Mic, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { exerciseSets, type ExerciseSet } from "./data/exercises";

// ─── Phase result overlay ────────────────────────────────────────────────────
function PhaseResultOverlay({
  result,
  word,
}: {
  result: "success" | "error";
  word: string;
}) {
  return (
    <motion.div
      key={result}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl z-20"
      style={{
        background:
          result === "success"
            ? "linear-gradient(135deg, rgba(54,179,126,0.96), rgba(87,217,163,0.96))"
            : "linear-gradient(135deg, rgba(255,86,48,0.96), rgba(255,116,82,0.96))",
        backdropFilter: "blur(4px)",
      }}
    >
      <motion.span
        animate={{
          rotate:
            result === "success" ? [0, -10, 10, -6, 6, 0] : [0, -8, 8, 0],
        }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ fontSize: 72, display: "block", marginBottom: 12 }}
      >
        {result === "success" ? "🌟" : "💪"}
      </motion.span>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 28,
          fontWeight: 800,
          color: "#fff",
          textAlign: "center",
        }}
      >
        {result === "success" ? "Muito bem! 🎉" : "Tente de novo!"}
      </motion.p>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 16,
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          marginTop: 6,
          textAlign: "center",
        }}
      >
        {result === "success" ? `"${word}" – perfeito!` : "Você consegue! 😊"}
      </motion.p>
    </motion.div>
  );
}

// ─── Completion modal ────────────────────────────────────────────────────────
function CompletionModal({
  exercise,
  points,
  onHome,
  onContinue,
}: {
  exercise: ExerciseSet;
  points: number;
  onHome: () => void;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-end md:items-center justify-center z-50 p-0 md:p-6"
      style={{ background: "rgba(0,0,0,0.55)" }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="w-full md:max-w-xl rounded-t-3xl md:rounded-3xl overflow-hidden"
        style={{ background: "#fff", paddingBottom: 36 }}
      >
        <div
          className="h-2"
          style={{
            background: `linear-gradient(90deg, ${exercise.color}, #FFD700, #36B37E, ${exercise.color})`,
          }}
        />

        <div className="px-6 pt-6 flex flex-col items-center gap-5">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${exercise.color}22, ${exercise.color}44)`,
              }}
            >
              <span style={{ fontSize: 52 }}>🏆</span>
            </div>
          </motion.div>

          <motion.div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.3 + i * 0.08,
                  type: "spring",
                  stiffness: 300,
                }}
                style={{ fontSize: 28 }}
              >
                ⭐
              </motion.span>
            ))}
          </motion.div>

          <div className="text-center">
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "#1A2B5F",
                lineHeight: 1.1,
                marginBottom: 6,
              }}
            >
              Parabéns! 🎉
            </h2>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: "#6B7A99",
                lineHeight: 1.5,
              }}
            >
              Você completou o exercício{" "}
              <strong style={{ color: exercise.color }}>{exercise.title}</strong>!
            </p>
          </div>

          <div
            className="flex items-center gap-3 px-6 py-3 rounded-2xl"
            style={{
              background: `${exercise.color}15`,
              border: `2px solid ${exercise.color}30`,
            }}
          >
            <span style={{ fontSize: 24 }}>🌟</span>
            <div>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: exercise.color,
                }}
              >
                +{points} estrelas
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 12,
                  color: "#6B7A99",
                  fontWeight: 400,
                }}
              >
                ganhas neste exercício!
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 mt-1">
            <button
              onClick={onContinue}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${exercise.color}, ${exercise.color}CC)`,
                color: "#fff",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                boxShadow: `0 6px 20px ${exercise.color}40`,
              }}
            >
              <span style={{ fontSize: 20 }}>▶️</span>
              Continuar exercícios!
            </button>
            <button
              onClick={onHome}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: "#F4F7FF",
                color: "#6B7A99",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                border: "2px solid #DBEAFE",
                cursor: "pointer",
              }}
            >
              <Home size={18} color="#6B7A99" />
              Voltar ao início
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ChildExercise() {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();

  const exercise =
    exerciseSets.find((e) => e.id === exerciseId) ?? exerciseSets[0];
  const currentExerciseIdx = exerciseSets.findIndex(
    (e) => e.id === exercise.id
  );

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [phaseResult, setPhaseResult] = useState<"success" | "error" | null>(
    null
  );
  const [points, setPoints] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = exercise.phases[phaseIndex];
  const totalPhases = exercise.phases.length;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    setPhaseIndex(0);
    setPhaseResult(null);
    setPoints(0);
    setShowCompletion(false);
  }, [exerciseId]);

  const handleMicPress = () => {
    if (isRecording || phaseResult !== null) return;
    setIsRecording(true);
    setRecordProgress(0);

    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 5;
      setRecordProgress(p);
      if (p >= 100) {
        clearInterval(intervalRef.current!);
        setIsRecording(false);

        const success = Math.random() > 0.25;
        setPhaseResult(success ? "success" : "error");

        if (success) {
          setPoints((prev) => prev + 1);
          setTimeout(() => {
            setPhaseResult(null);
            if (phaseIndex + 1 >= totalPhases) {
              setShowCompletion(true);
            } else {
              setPhaseIndex((prev) => prev + 1);
            }
          }, 1600);
        } else {
          setTimeout(() => {
            setPhaseResult(null);
          }, 1800);
        }
      }
    }, 60);
  };

  const handleHome = () => navigate("/child/home");
  const handleContinue = () => {
    const next = exerciseSets[(currentExerciseIdx + 1) % exerciseSets.length];
    navigate(`/child/exercise/${next.id}`);
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="flex min-h-screen"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: "#F4F7FF",
        }}
      >
        {/* Desktop Version */}
        <div className="hidden md:flex md:flex-col md:flex-1 min-h-screen">
          {/* Desktop Top Bar */}
          <div
            className="flex items-center justify-between px-8 lg:px-12 xl:px-16 py-5 border-b border-gray-200"
            style={{ background: "#fff" }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={handleHome}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-gray-100 flex-shrink-0"
                style={{
                  background: "#F4F7FF",
                  border: "2px solid #DBEAFE",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={22} color="#0052CC" />
              </button>

              <div className="min-w-0">
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#1A2B5F",
                  }}
                >
                  {exercise.emoji} {exercise.title}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#6B7A99",
                    fontWeight: 400,
                  }}
                >
                  Fase {phaseIndex + 1} de {totalPhases}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-2">
                {exercise.phases.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-400"
                    style={{
                      width: i === phaseIndex ? 32 : 10,
                      height: 10,
                      background:
                        i < phaseIndex
                          ? "#36B37E"
                          : i === phaseIndex
                          ? exercise.color
                          : "#DBEAFE",
                      transition: "all 0.35s ease",
                    }}
                  />
                ))}
              </div>

              <div
                className="flex items-center gap-2 px-4 lg:px-5 py-3 rounded-2xl"
                style={{ background: "#FFFBEB", border: "2px solid #FDE68A" }}
              >
                <span style={{ fontSize: 20 }}>⭐</span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#FFAB00",
                  }}
                >
                  {points}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="px-8 lg:px-12 xl:px-16 py-4"
            style={{ background: "#fff", borderBottom: "1px solid #DBEAFE" }}
          >
            <div
              className="rounded-full overflow-hidden max-w-5xl mx-auto"
              style={{ height: 10, background: "#DBEAFE" }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${(phaseIndex / totalPhases) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  background: `linear-gradient(90deg, ${exercise.color}, ${exercise.color}99)`,
                }}
              />
            </div>
          </div>

          {/* Main Exercise Area Desktop */}
          <div className="flex-1 overflow-y-auto min-h-0 px-8 lg:px-12 xl:px-16 py-8">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[minmax(300px,360px)_minmax(420px,1fr)] gap-8 items-stretch">
              {/* Left info panel */}
              <div
                className="rounded-[32px] p-6 xl:sticky xl:top-8 h-full flex flex-col"
                style={{
                  background: "#fff",
                  border: "1.5px solid #DBEAFE",
                  boxShadow: "0 6px 24px rgba(0,82,204,0.06)",
                }}
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                  style={{ background: exercise.bgColor }}
                >
                  <span style={{ fontSize: 42 }}>{phase.emoji}</span>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "#6B7A99",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  EXERCÍCIO ATUAL
                </p>

                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "#1A2B5F",
                    lineHeight: 1.15,
                    marginBottom: 12,
                  }}
                >
                  {exercise.title}
                </h2>

                <p
                  style={{
                    fontSize: 15,
                    color: "#6B7A99",
                    fontWeight: 400,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  {phase.instruction}
                </p>

                {phase.hint && (
                  <div
                    className="rounded-2xl px-4 py-3 mb-5"
                    style={{
                      background: `${exercise.color}10`,
                      border: `1.5px solid ${exercise.color}20`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#4F5D7A",
                      }}
                    >
                      💡 {phase.hint}
                    </p>
                  </div>
                )}

                <div className="space-y-3 mt-auto">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "#F4F7FF",
                      border: "1.5px solid #DBEAFE",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7A99",
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      PALAVRA
                    </p>
                    <p
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: exercise.color,
                        letterSpacing: 2,
                        lineHeight: 1,
                      }}
                    >
                      {phase.word}
                    </p>
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl transition-all hover:bg-gray-100"
                    style={{
                      background: "#F4F7FF",
                      border: "2px solid #DBEAFE",
                      cursor: "pointer",
                    }}
                  >
                    <Volume2 size={20} color={exercise.color} />
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: exercise.color,
                      }}
                    >
                      Ouvir exemplo
                    </span>
                  </button>
                </div>
              </div>

              {/* Main card */}
              <div className="w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={phaseIndex}
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative rounded-[40px] overflow-hidden shadow-2xl h-full flex flex-col"
                    style={{
                      background: "#ffffff",
                      border: `3px solid ${exercise.color}30`,
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        background: exercise.bgColor,
                        minHeight: 180,
                        height: "clamp(180px, 24vh, 240px)",
                      }}
                    >
                      <motion.span
                        animate={{ scale: [1, 1.06, 1] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          fontSize: "clamp(82px, 10vw, 130px)",
                          lineHeight: 1,
                        }}
                      >
                        {phase.emoji}
                      </motion.span>
                    </div>

                    <div className="px-6 lg:px-8 py-8 text-center">
                      <p
                        style={{
                          fontSize: 16,
                          color: "#B0BAD3",
                          fontWeight: 500,
                          marginBottom: 8,
                        }}
                      >
                        {phase.instruction}
                      </p>

                      <motion.p
                        key={phase.word}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          fontSize: "clamp(42px, 6vw, 64px)",
                          fontWeight: 800,
                          color: exercise.color,
                          letterSpacing: 2,
                          lineHeight: 1.1,
                          wordBreak: "break-word",
                        }}
                      >
                        {phase.word}
                      </motion.p>
                    </div>

                    <div className="px-6 lg:px-8 pb-8 flex flex-col items-center justify-end gap-5 flex-1">
                      <button
                        onClick={handleMicPress}
                        disabled={isRecording || phaseResult !== null}
                        className="relative transition-all duration-200"
                        style={{
                          width: "clamp(112px, 14vw, 140px)",
                          height: "clamp(112px, 14vw, 140px)",
                          borderRadius: "50%",
                          background: isRecording
                            ? `linear-gradient(135deg, ${exercise.color}, ${exercise.color}CC)`
                            : `linear-gradient(135deg, ${exercise.color}, ${exercise.color}DD)`,
                          border: `4px solid ${exercise.color}40`,
                          cursor:
                            isRecording || phaseResult !== null
                              ? "not-allowed"
                              : "pointer",
                          boxShadow: isRecording
                            ? `0 0 0 0 ${exercise.color}40`
                            : `0 8px 30px ${exercise.color}35`,
                          opacity: phaseResult ? 0.5 : 1,
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isRecording ? (
                            <div className="flex gap-1.5">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ scaleY: [1, 1.8, 1] }}
                                  transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeInOut",
                                  }}
                                  className="rounded-full"
                                  style={{
                                    width: 6,
                                    height: 28,
                                    background: "#fff",
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            <Mic
                              size={48}
                              color="white"
                              strokeWidth={2.2}
                            />
                          )}
                        </div>

                        {isRecording && (
                          <svg
                            className="absolute inset-0 -rotate-90"
                            style={{ width: "100%", height: "100%" }}
                          >
                            <circle
                              cx="50%"
                              cy="50%"
                              r="66"
                              stroke="white"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 66}`}
                              strokeDashoffset={`${
                                2 *
                                Math.PI *
                                66 *
                                (1 - recordProgress / 100)
                              }`}
                              style={{
                                transition: "stroke-dashoffset 0.1s linear",
                              }}
                            />
                          </svg>
                        )}
                      </button>

                      <p
                        style={{
                          fontSize: 16,
                          color: "#6B7A99",
                          fontWeight: 500,
                          textAlign: "center",
                        }}
                      >
                        {isRecording
                          ? "🎤 Gravando..."
                          : "Clique e fale a palavra!"}
                      </p>

                      {isRecording && (
                        <div className="w-full max-w-sm">
                          <div
                            className="rounded-full overflow-hidden"
                            style={{ height: 8, background: "#DBEAFE" }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              animate={{ width: `${recordProgress}%` }}
                              transition={{ duration: 0.06 }}
                              style={{
                                background: `linear-gradient(90deg, ${exercise.color}, ${exercise.color}BB)`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {phaseResult && (
                        <PhaseResultOverlay
                          result={phaseResult}
                          word={phase.word}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Version */}
        <div
          className="md:hidden flex flex-col flex-1 relative"
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: "#F4F7FF",
          }}
        >
          <div className="px-5 md:px-7 pt-14 md:pt-16 flex items-center justify-between flex-shrink-0">
            <button
              onClick={handleHome}
              className="w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90"
              style={{
                background: "#ffffff",
                border: "2px solid #DBEAFE",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,82,204,0.08)",
              }}
            >
              <ArrowLeft size={20} color="#0052CC" />
            </button>

            <div className="flex items-center gap-1.5">
              {exercise.phases.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-400"
                  style={{
                    width: i === phaseIndex ? 26 : 8,
                    height: 8,
                    background:
                      i < phaseIndex
                        ? "#36B37E"
                        : i === phaseIndex
                        ? exercise.color
                        : "#DBEAFE",
                    transition: "all 0.35s ease",
                  }}
                />
              ))}
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl"
              style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}
            >
              <span style={{ fontSize: 16 }}>⭐</span>
              <span
                style={{ fontSize: 14, fontWeight: 700, color: "#FFAB00" }}
              >
                {points}
              </span>
            </div>
          </div>

          <div className="px-5 md:px-7 mt-4 flex items-center justify-between flex-shrink-0">
            <div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#1A2B5F",
                  lineHeight: 1,
                }}
              >
                {exercise.emoji} {exercise.title}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#6B7A99",
                  fontWeight: 400,
                  marginTop: 2,
                }}
              >
                Fase {phaseIndex + 1} de {totalPhases}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: exercise.bgColor }}
            >
              <span style={{ fontSize: 22 }}>{phase.emoji}</span>
            </div>
          </div>

          <div className="px-5 mt-3 flex-shrink-0">
            <div
              className="rounded-full overflow-hidden"
              style={{ height: 7, background: "#DBEAFE" }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${(phaseIndex / totalPhases) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  background: `linear-gradient(90deg, ${exercise.color}, ${exercise.color}99)`,
                }}
              />
            </div>
          </div>

          <div className="flex-1 w-full px-5 pt-4 pb-2 flex flex-col justify-start gap-4 min-h-0">
            {/* Card superior: dica / exercício */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, x: 40, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.97 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="relative w-full rounded-3xl overflow-hidden shadow-lg flex-shrink-0"
                style={{
                  background: "#ffffff",
                  border: `2px solid ${exercise.color}25`,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    background: exercise.bgColor,
                    height: 150,
                  }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ fontSize: 86, lineHeight: 1 }}
                  >
                    {phase.emoji}
                  </motion.span>
                </div>

                <div className="px-4 py-4">
                  <p
                    style={{
                      fontSize: 11,
                      color: "#6B7A99",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    EXERCÍCIO ATUAL
                  </p>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#B0BAD3",
                      fontWeight: 500,
                      marginBottom: 6,
                    }}
                  >
                    {phase.instruction}
                  </p>

                  <motion.p
                    key={phase.word}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      color: exercise.color,
                      letterSpacing: 3,
                      lineHeight: 1.05,
                      marginBottom: 10,
                    }}
                  >
                    {phase.word}
                  </motion.p>

                  {phase.hint && (
                    <div
                      className="rounded-2xl px-3.5 py-3"
                      style={{
                        background: `${exercise.color}10`,
                        border: `1.5px solid ${exercise.color}20`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#4F5D7A",
                          lineHeight: 1.45,
                        }}
                      >
                        💡 {phase.hint}
                      </p>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {phaseResult && (
                    <PhaseResultOverlay result={phaseResult} word={phase.word} />
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Card inferior: gravar resposta */}
            <div
              className="w-full rounded-3xl shadow-lg flex flex-col items-center justify-center px-5 py-6"
              style={{
                background: "#ffffff",
                border: "2px solid #DBEAFE",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "#6B7A99",
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                GRAVE SUA RESPOSTA
              </p>

              <div className="relative flex items-center justify-center mb-3">
                {!isRecording && !phaseResult && (
                  <>
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        background: `${exercise.color}15`,
                        width: 80,
                        height: 80,
                      }}
                      animate={{
                        scale: [1, 1.18, 1],
                        opacity: [0.6, 0.15, 0.6],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        background: `${exercise.color}10`,
                        width: 80,
                        height: 80,
                      }}
                      animate={{
                        scale: [1, 1.35, 1],
                        opacity: [0.4, 0, 0.4],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4,
                      }}
                    />
                  </>
                )}

                <motion.button
                  onClick={handleMicPress}
                  whileTap={{ scale: 0.88 }}
                  disabled={isRecording || phaseResult !== null}
                  className="relative flex items-center justify-center rounded-full"
                  style={{
                    width: 92,
                    height: 92,
                    background: isRecording
                      ? "linear-gradient(135deg, #FF5630, #FF7452)"
                      : phaseResult
                      ? "#D1D9E8"
                      : `linear-gradient(135deg, ${exercise.color}, ${exercise.color}BB)`,
                    border: "none",
                    cursor: isRecording || phaseResult ? "default" : "pointer",
                    boxShadow: isRecording
                      ? "0 8px 32px rgba(255,86,48,0.5)"
                      : `0 8px 32px ${exercise.color}45`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <Mic size={38} color="white" strokeWidth={1.8} />
                </motion.button>
              </div>

              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isRecording
                    ? "#FF5630"
                    : phaseResult
                    ? "#B0BAD3"
                    : "#6B7A99",
                  transition: "color 0.3s",
                  textAlign: "center",
                }}
              >
                {isRecording
                  ? "Gravando... 🎙️"
                  : phaseResult === "success"
                  ? "Indo para próxima fase... ✨"
                  : phaseResult === "error"
                  ? "Tente de novo! 💪"
                  : "Toque para gravar"}
              </p>

              {isRecording && (
                <div className="w-full mt-4">
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: 8, background: "#DBEAFE" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${recordProgress}%` }}
                      transition={{ duration: 0.06 }}
                      style={{
                        background: `linear-gradient(90deg, ${exercise.color}, ${exercise.color}BB)`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showCompletion && (
              <CompletionModal
                exercise={exercise}
                points={points}
                onHome={handleHome}
                onContinue={handleContinue}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileWrapper>
  );
}
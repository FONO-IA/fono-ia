import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { LogOut, Star, Lock, Play } from "lucide-react";
import { motion } from "motion/react";
import { exerciseSets } from "./data/exercises";

function DifficultyStars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((s) => (
        <Star
          key={s}
          size={11}
          fill={s <= level ? "#FFD700" : "none"}
          color={s <= level ? "#FFD700" : "#D1D9E8"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function ChildExerciseList() {
  const navigate = useNavigate();
  const [completedIds, setCompletedIds] = useState<string[]>(["vogais"]); // demo: vogais já feito
  const totalStars = completedIds.length * 5;

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div className="flex h-screen" style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}>
        {/* Desktop - Full Screen */}
        <div className="hidden md:flex md:flex-col md:flex-1">
          {/* Header Desktop */}
          <div className="relative overflow-hidden px-12 lg:px-20 py-10" style={{ background: "linear-gradient(150deg, #003884 0%, #0052CC 55%, #0065FF 100%)" }}>
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: "#fff" }} />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-8" style={{ background: "#fff" }} />

            <div className="flex items-center justify-between relative z-10 max-w-7xl mx-auto">
              <div>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", fontWeight: 400, marginBottom: 8 }}>
                  Bem-vindo de volta! 👋
                </p>
                <h1 style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 8 }}>
                  Vamos praticar! 🎙️
                </h1>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                  Escolha um exercício abaixo para começar
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-6 py-4 rounded-3xl" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <span style={{ fontSize: 32 }}>⭐</span>
                  <div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Total de estrelas</p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#FFD700" }}>{totalStars}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:bg-white/20"
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer" }}
                >
                  <LogOut size={24} color="rgba(255,255,255,0.85)" />
                </button>
              </div>
            </div>
          </div>

          {/* Exercises Grid Desktop */}
          <div className="flex-1 overflow-y-auto px-12 lg:px-20 py-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {exerciseSets.map((ex) => {
                const completed = completedIds.includes(ex.id);
                const locked = ex.id !== "vogais" && !completed && !completedIds.includes("vogais");

                return (
                  <motion.button
                    key={ex.id}
                    onClick={() => !locked && navigate(`/child/exercise/${ex.id}`)}
                    whileHover={!locked ? { scale: 1.02, y: -4 } : {}}
                    whileTap={!locked ? { scale: 0.98 } : {}}
                    disabled={locked}
                    className="text-left rounded-[32px] p-6 flex flex-col gap-4 transition-all"
                    style={{
                      background: locked ? "#E8EBF0" : "#ffffff",
                      border: `3px solid ${locked ? "#D1D9E8" : completed ? "#36B37E" : "#DBEAFE"}`,
                      boxShadow: locked ? "none" : completed ? "0 6px 24px rgba(54,179,126,0.2)" : "0 6px 24px rgba(0,82,204,0.12)",
                      cursor: locked ? "not-allowed" : "pointer",
                      opacity: locked ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: locked ? "#D1D9E8" : `${ex.color}22`, fontSize: 32 }}>
                        {locked ? "🔒" : ex.emoji}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {completed && (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: "#ECFDF5" }}>
                            <span style={{ fontSize: 14 }}>✅</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#36B37E" }}>Completo</span>
                          </div>
                        )}
                        {!locked && !completed && (
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${ex.color}15` }}>
                            <Play size={20} color={ex.color} fill={ex.color} />
                          </div>
                        )}
                        {locked && (
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#E8EBF0" }}>
                            <Lock size={20} color="#B0BAD3" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: 22, fontWeight: 800, color: locked ? "#B0BAD3" : "#1A2B5F", marginBottom: 6 }}>
                        {ex.title}
                      </h3>
                      <p style={{ fontSize: 14, color: locked ? "#B0BAD3" : "#6B7A99", fontWeight: 400, lineHeight: 1.5, marginBottom: 8 }}>
                        {ex.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <DifficultyStars level={ex.difficulty} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: locked ? "#B0BAD3" : "#6B7A99" }}>
                          {ex.phases.length || 0} palavras
                        </span>
                      </div>
                    </div>

                    {locked && (
                      <p style={{ fontSize: 11, color: "#B0BAD3", fontWeight: 500, textAlign: "center", marginTop: 4 }}>
                        Complete os exercícios anteriores para desbloquear
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Version */}
        <div className="md:hidden flex flex-col flex-1" style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}>
          {/* Header */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{
              background: "linear-gradient(150deg, #003884 0%, #0052CC 55%, #0065FF 100%)",
              paddingTop: 56,
              paddingBottom: 28,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            {/* Decorations */}
            <div className="absolute -top-10 -right-10 w-40 h-40 md:w-48 md:h-48 rounded-full opacity-10" style={{ background: "#fff" }} />
            <div className="absolute bottom-0 left-1/4 w-24 h-24 md:w-32 md:h-32 rounded-full opacity-8" style={{ background: "#fff" }} />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 400, marginBottom: 4 }}>
                  Bem-vindo de volta! 👋
                </p>
                <h1 className="md:text-3xl" style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                  Vamos praticar! 🎙️
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 400, marginTop: 4 }}>
                  Escolha um exercício abaixo
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={() => navigate("/")}
                className="w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer" }}
              >
                <LogOut size={18} color="rgba(255,255,255,0.8)" />
              </button>
            </div>

            {/* Stars counter */}
            <div className="flex items-center gap-3 mt-5 relative z-10">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <span style={{ fontSize: 18 }}>⭐</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#FFD700" }}>{totalStars}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>estrelas</span>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <span style={{ fontSize: 18 }}>🏆</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  {completedIds.length}/{exerciseSets.length}
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>feitos</span>
              </div>
            </div>
          </div>

          {/* Exercise grid */}
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6B7A99",
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 14,
                paddingLeft: 2,
              }}
            >
              Exercícios disponíveis
            </p>

            <div className="flex flex-col gap-4">
              {exerciseSets.map((ex, i) => {
                const done = completedIds.includes(ex.id);
                return (
                  <motion.button
                    key={ex.id}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
                    onClick={() => navigate(`/child/exercise/${ex.id}`)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-3xl transition-all active:scale-96"
                    style={{
                      background: "#ffffff",
                      border: `2.5px solid ${done ? ex.color + "40" : "#DBEAFE"}`,
                      boxShadow: done
                        ? `0 4px 18px ${ex.color}18`
                        : "0 2px 10px rgba(0,82,204,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    {/* Emoji card */}
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                      style={{ background: ex.bgColor }}
                    >
                      <span style={{ fontSize: 42 }}>{ex.emoji}</span>
                      {done && (
                        <div
                          className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center"
                          style={{ background: "#36B37E" }}
                        >
                          <span style={{ fontSize: 14 }}>✓</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p style={{ fontSize: 17, fontWeight: 800, color: ex.color }}>
                          {ex.title}
                        </p>
                      </div>
                      <p style={{ fontSize: 12, color: "#6B7A99", fontWeight: 400, marginBottom: 6, lineHeight: 1.4 }}>
                        {ex.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <DifficultyStars level={ex.difficulty} />
                        <span
                          className="px-2.5 py-1 rounded-xl"
                          style={{
                            background: ex.bgColor,
                            fontSize: 11,
                            fontWeight: 600,
                            color: ex.color,
                          }}
                        >
                          {ex.phases.length} fases
                        </span>
                        {done && (
                          <span
                            className="px-2.5 py-1 rounded-xl"
                            style={{ background: "#ECFDF5", fontSize: 11, fontWeight: 600, color: "#36B37E" }}
                          >
                            ⭐ {ex.phases.length} pts
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Play button */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: done ? "#ECFDF5" : ex.color }}
                    >
                      {done
                        ? <span style={{ fontSize: 20 }}>🔁</span>
                        : <Play size={20} color="white" fill="white" />
                      }
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Motivational footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 rounded-3xl p-5 flex items-center gap-4"
              style={{ background: "linear-gradient(135deg, #EBF3FF, #DBEAFE)", border: "1.5px solid #93C5FD" }}
            >
              <span style={{ fontSize: 36, flexShrink: 0 }}>🏅</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B5F" }}>
                  Continue praticando!
                </p>
                <p style={{ fontSize: 12, color: "#6B7A99", fontWeight: 400, lineHeight: 1.5 }}>
                  Complete todos os exercícios para ganhar um troféu especial! 🎉
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}
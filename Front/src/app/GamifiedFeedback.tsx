import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, ArrowRight, RotateCcw, Home } from "lucide-react";

function StarIcon({ delay = 0, size = 52 }: { delay?: number; size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 300,
        damping: 14,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
        <path
          d="M26 4L31.5 18.5H47L34.5 27.5L39 42L26 33L13 42L17.5 27.5L5 18.5H20.5L26 4Z"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M26 8L30.2 19.3L30.6 20.4H31.8L43.6 20.4L34 27.4L33.1 28.1L33.4 29.2L37.1 40.4L27.9 34.1L27 33.5L26.1 34.1L16.9 40.4L20.6 29.2L20.9 28.1L20 27.4L10.4 20.4H22.2L22.6 20.4L23 19.3L26 8Z"
          fill="#FFE44D"
        />
      </svg>
    </motion.div>
  );
}

function ConfettiPiece({
  x,
  color,
  delay,
}: {
  x: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ left: `${x}%`, top: -10, background: color }}
      animate={{
        y: [0, 700],
        rotate: [0, 360 * 3],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 2.5 + Math.random(),
        delay,
        ease: "easeIn",
      }}
    />
  );
}

const confettiColors = [
  "#0052CC",
  "#FFD700",
  "#36B37E",
  "#FF5630",
  "#998DD9",
  "#57D9A3",
  "#FFA500",
];

const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: 5 + (i / 20) * 90,
  color: confettiColors[i % confettiColors.length],
  delay: (i / 20) * 0.8,
}));

export function GamifiedFeedback() {
  const navigate = useNavigate();
  const { state } = useParams<{ state: string }>();
  const isSuccess = state === "success";
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <MobileWrapper bgColor={isSuccess ? "#F0FDF4" : "#FFFBEB"}>
      <div
        className="flex flex-col flex-1 relative overflow-hidden"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: isSuccess
            ? "linear-gradient(170deg, #F0FDF4 0%, #ECFDF5 50%, #ffffff 100%)"
            : "linear-gradient(170deg, #FFFBEB 0%, #FEF3C7 50%, #ffffff 100%)",
        }}
      >
        {/* Confetti for success */}
        {isSuccess && showContent && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((p) => (
              <ConfettiPiece
                key={p.id}
                x={p.x}
                color={p.color}
                delay={p.delay}
              />
            ))}
          </div>
        )}

        {/* Background decoration */}
        <div
          className="absolute top-0 left-0 right-0 h-72 rounded-b-full opacity-20"
          style={{
            background: isSuccess
              ? "radial-gradient(ellipse at 50% -20%, #36B37E 0%, transparent 70%)"
              : "radial-gradient(ellipse at 50% -20%, #FFAB00 0%, transparent 70%)",
          }}
        />

        {/* Home button */}
        <div className="px-6 pt-14 flex items-center justify-between relative z-10">
          <button
            onClick={() => navigate("/admin")}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "2px solid rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
          >
            <Home size={20} color="#6B7A99" />
          </button>
          <div
            className="px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.8)" }}
          >
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "#6B7A99",
              }}
            >
              MAÇÃ
            </span>
          </div>
          <div style={{ width: 44 }} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
          {isSuccess ? (
            <AnimatePresence>
              {showContent && (
                <motion.div
                  className="flex flex-col items-center gap-6 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Stars */}
                  <div className="flex items-end gap-3">
                    <StarIcon delay={0.2} size={44} />
                    <StarIcon delay={0.4} size={60} />
                    <StarIcon delay={0.6} size={44} />
                  </div>

                  {/* Check circle */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.8,
                      type: "spring",
                      stiffness: 250,
                      damping: 12,
                    }}
                    className="flex items-center justify-center"
                  >
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #36B37E, #57D9A3)",
                      }}
                    >
                      <CheckCircle
                        size={52}
                        color="white"
                        strokeWidth={2.5}
                        fill="rgba(255,255,255,0.15)"
                      />
                    </div>
                  </motion.div>

                  {/* Text */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                  >
                    <h1
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 34,
                        fontWeight: 800,
                        color: "#1A4D3E",
                        lineHeight: 1.15,
                        marginBottom: 10,
                      }}
                    >
                      Muito Bem! 🎉
                    </h1>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 16,
                        fontWeight: 400,
                        color: "#36B37E",
                        lineHeight: 1.5,
                      }}
                    >
                      Você pronunciou "MAÇÃ" perfeitamente!
                    </p>
                  </motion.div>

                  {/* Score card */}
                  <motion.div
                    className="w-full rounded-3xl p-5 flex items-center justify-between"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "2px solid #D1FAE5",
                      backdropFilter: "blur(8px)",
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                  >
                    <div className="text-center flex-1">
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#36B37E",
                        }}
                      >
                        95%
                      </p>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 11,
                          color: "#6B7A99",
                          fontWeight: 400,
                        }}
                      >
                        Precisão
                      </p>
                    </div>
                    <div
                      className="w-px h-10"
                      style={{ background: "#D1FAE5" }}
                    />
                    <div className="text-center flex-1">
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#0052CC",
                        }}
                      >
                        +10
                      </p>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 11,
                          color: "#6B7A99",
                          fontWeight: 400,
                        }}
                      >
                        Pontos
                      </p>
                    </div>
                    <div
                      className="w-px h-10"
                      style={{ background: "#D1FAE5" }}
                    />
                    <div className="text-center flex-1">
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#FFD700",
                        }}
                      >
                        ⭐ 3
                      </p>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 11,
                          color: "#6B7A99",
                          fontWeight: 400,
                        }}
                      >
                        Estrelas
                      </p>
                    </div>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    className="w-full flex flex-col gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.4 }}
                  >
                    <button
                      onClick={() => navigate("/exercise")}
                      className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #36B37E, #57D9A3)",
                        color: "#fff",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 16,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 6px 20px rgba(54,179,126,0.4)",
                      }}
                    >
                      Próximo Exercício
                      <ArrowRight size={20} />
                    </button>
                    <button
                      onClick={() => navigate("/admin")}
                      className="w-full py-3 rounded-2xl"
                      style={{
                        background: "transparent",
                        color: "#6B7A99",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 14,
                        fontWeight: 500,
                        border: "2px solid #D1FAE5",
                        cursor: "pointer",
                      }}
                    >
                      Ir para o início
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              {showContent && (
                <motion.div
                  className="flex flex-col items-center gap-6 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Friendly character */}
                  <motion.div
                    animate={{
                      y: [0, -12, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #FFE44D, #FFD700)",
                      }}
                    >
                      <span style={{ fontSize: 64 }}>🤗</span>
                    </div>
                  </motion.div>

                  {/* Text */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h1
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 30,
                        fontWeight: 800,
                        color: "#7C3D00",
                        lineHeight: 1.2,
                        marginBottom: 10,
                      }}
                    >
                      Quase lá! 💪
                    </h1>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#D97706",
                        marginBottom: 6,
                      }}
                    >
                      Vamos tentar de novo?
                    </p>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 14,
                        fontWeight: 400,
                        color: "#92400E",
                        lineHeight: 1.6,
                        opacity: 0.8,
                      }}
                    >
                      Respira fundo e repete devagarzinho:
                    </p>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 36,
                        fontWeight: 800,
                        color: "#0052CC",
                        letterSpacing: 4,
                        marginTop: 8,
                      }}
                    >
                      MA-ÇÃ
                    </p>
                  </motion.div>

                  {/* Tip card */}
                  <motion.div
                    className="w-full rounded-3xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "2px solid #FDE68A",
                      backdropFilter: "blur(8px)",
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#FEF3C7" }}
                      >
                        <span style={{ fontSize: 18 }}>💡</span>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#92400E",
                            marginBottom: 4,
                          }}
                        >
                          Dica do Terapeuta
                        </p>
                        <p
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: 12,
                            fontWeight: 400,
                            color: "#78350F",
                            lineHeight: 1.6,
                          }}
                        >
                          Coloque a língua atrás dos dentes de cima e sopre
                          suavemente ao dizer "MAÇÃ".
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <div
                        style={{
                          flex: 1,
                          height: 5,
                          borderRadius: 10,
                          background: "#FDE68A",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: "52%",
                            height: "100%",
                            background: "#FFAB00",
                            borderRadius: 10,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#FFAB00",
                        }}
                      >
                        52%
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 10,
                        color: "#B0BAD3",
                        fontWeight: 400,
                        marginTop: 4,
                      }}
                    >
                      FN06 · Continue praticando!
                    </p>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    className="w-full flex flex-col gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    <button
                      onClick={() => navigate("/exercise")}
                      className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
                        color: "#fff",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 16,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 6px 20px rgba(245,158,11,0.4)",
                      }}
                    >
                      <RotateCcw size={20} />
                      Tentar Novamente
                    </button>
                    <button
                      onClick={() => navigate("/exercise")}
                      className="w-full py-3 rounded-2xl"
                      style={{
                        background: "transparent",
                        color: "#6B7A99",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 14,
                        fontWeight: 500,
                        border: "2px solid #FDE68A",
                        cursor: "pointer",
                      }}
                    >
                      Pular exercício
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Bottom safe area */}
        <div style={{ height: 32 }} />
      </div>
    </MobileWrapper>
  );
}

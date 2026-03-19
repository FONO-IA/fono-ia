import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import {
  ArrowLeft,
  Delete,
  AlertCircle,
  ChevronRight,
  User,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Step = "code" | "pin";

export function ChildLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("code");
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [pin, setPin] = useState<string[]>([]);
  const [pinError, setPinError] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  useEffect(() => {
    if (step === "code") {
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const resetPinState = () => {
    setPin([]);
    setPinError(false);
    setShake(false);
    setSuccess(false);
  };

  const goToCodeStep = () => {
    resetPinState();
    setStep("code");
  };

  const handleBack = () => {
    if (step === "pin") {
      goToCodeStep();
      return;
    }
    navigate("/");
  };

  const handleCodeSubmit = () => {
    const trimmed = accessCode.trim();

    if (!trimmed) {
      setCodeError("Digite seu código de acesso!");
      return;
    }

    if (trimmed.length < 3) {
      setCodeError("Código muito curto. Verifique com seu terapeuta.");
      return;
    }

    setCodeError("");
    resetPinState();
    setStep("pin");
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= 4 || success) return;

    const newPin = [...pin, digit];
    setPin(newPin);

    if (newPin.length === 4) {
      const isCorrect = true;

      if (isCorrect) {
        setSuccess(true);
        setTimeout(() => navigate("/child/home"), 950);
      } else {
        setShake(true);
        setPinError(true);

        setTimeout(() => {
          setShake(false);
          setPinError(false);
          setPin([]);
        }, 950);
      }
    }
  };

  const handleBackspace = () => {
    if (success) return;
    if (pin.length > 0) setPin((p) => p.slice(0, -1));
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="flex min-h-screen"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Desktop Left Side */}
        <div
          className="hidden md:flex md:flex-col md:w-[42%] xl:w-[38%] min-h-screen items-center justify-center px-8 lg:px-12 xl:px-16 py-10 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(150deg, #EBF3FF 0%, #DBEAFE 50%, #C7E0FF 100%)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-10 right-10 w-96 h-96 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #0065FF22 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-10 left-10 w-80 h-80 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #36B37E15 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10 w-full max-w-xl">
            <div
              className="w-28 h-28 lg:w-32 lg:h-32 rounded-[36px] lg:rounded-[40px] flex items-center justify-center shadow-2xl mb-8"
              style={{
                background: "linear-gradient(135deg, #003884 0%, #0065FF 100%)",
              }}
            >
              <span style={{ fontSize: 60 }}>🎙️</span>
            </div>

            <h2
              style={{
                fontSize: "clamp(32px, 3vw, 40px)",
                fontWeight: 800,
                color: "#1A2B5F",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Bem-vindo ao
              <br />
              FONO-IA! 🌟
            </h2>

            <p
              style={{
                fontSize: "clamp(16px, 1.4vw, 18px)",
                color: "#6B7A99",
                fontWeight: 400,
                lineHeight: 1.6,
                marginBottom: 32,
                maxWidth: 520,
              }}
            >
              Vamos praticar a fala de um jeito divertido! Primeiro, você
              precisa fazer o login.
            </p>

            <div className="space-y-4">
              {[
                {
                  emoji: "🏷️",
                  title: "Código de Acesso",
                  desc: "Seu terapeuta te deu este código",
                },
                {
                  emoji: "🔐",
                  title: "Senha Secreta",
                  desc: "4 números que só você sabe",
                },
                {
                  emoji: "🚀",
                  title: "Tudo Pronto!",
                  desc: "Hora de começar os exercícios",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-3xl"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    border: "2px solid rgba(0,82,204,0.15)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#fff" }}
                  >
                    <span style={{ fontSize: 24 }}>{item.emoji}</span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1A2B5F",
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6B7A99",
                        fontWeight: 400,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="flex flex-col flex-1 min-h-screen min-w-0 relative overflow-hidden"
          style={{ background: "#F4F7FF" }}
        >
          {/* Mobile blobs */}
          <div className="md:hidden absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #0065FF33 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-1/3 -left-16 w-48 h-48 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #998DD922 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-10 right-10 w-40 h-40 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #36B37E22 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Desktop Top Nav */}
          <div
            className="hidden md:flex items-center justify-between px-6 lg:px-8 xl:px-12 py-6 border-b border-gray-200 flex-shrink-0"
            style={{ background: "#fff" }}
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,82,204,0.1)" }}
              >
                <ArrowLeft size={18} color="#0052CC" />
              </div>
              <span
                style={{ fontSize: 14, color: "#6B7A99", fontWeight: 400 }}
              >
                Voltar
              </span>
            </button>

            <div className="flex items-center gap-3 flex-shrink-0">
              {(["code", "pin"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        step === s
                          ? "#0052CC"
                          : i === 0 && step === "pin"
                          ? "#36B37E"
                          : "#DBEAFE",
                      color:
                        step === s || (i === 0 && step === "pin")
                          ? "#fff"
                          : "#B0BAD3",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: step === s ? 600 : 400,
                      color: step === s ? "#1A2B5F" : "#B0BAD3",
                    }}
                  >
                    {s === "code" ? "Código" : "Senha"}
                  </span>
                  {i === 0 && (
                    <div
                      className="w-10 lg:w-12 h-0.5 mx-2"
                      style={{
                        background: step === "pin" ? "#36B37E" : "#DBEAFE",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Content */}
          <div className="hidden md:flex md:flex-1 md:min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto px-6 lg:px-8 xl:px-12 py-10">
              <div className="w-full max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                  {step === "code" && (
                    <motion.div
                      key="code-desktop"
                      initial={{ opacity: 0, x: -28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -28 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h1
                          style={{
                            fontSize: "clamp(30px, 3vw, 36px)",
                            fontWeight: 800,
                            color: "#1A2B5F",
                            marginBottom: 12,
                          }}
                        >
                          Olá! 👋
                        </h1>
                        <p
                          style={{
                            fontSize: 16,
                            color: "#6B7A99",
                            fontWeight: 400,
                          }}
                        >
                          Digite seu código de acesso para começar
                        </p>
                      </div>

                      <div
                        className="rounded-3xl p-6"
                        style={{
                          background: "#EBF3FF",
                          border: "2px solid #DBEAFE",
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "#0052CC" }}
                          >
                            <User size={28} color="white" strokeWidth={1.8} />
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#1A2B5F",
                                marginBottom: 4,
                              }}
                            >
                              Código de acesso
                            </p>
                            <p
                              style={{
                                fontSize: 14,
                                color: "#6B7A99",
                                fontWeight: 400,
                                lineHeight: 1.5,
                              }}
                            >
                              Seu terapeuta te deu este código. É como seu nome
                              de usuário!
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1A2B5F",
                            display: "block",
                            marginBottom: 12,
                            letterSpacing: 0.3,
                          }}
                        >
                          SEU CÓDIGO DE ACESSO
                        </label>

                        <div className="relative">
                          <div
                            className="absolute left-5 top-1/2 -translate-y-1/2"
                            style={{ pointerEvents: "none" }}
                          >
                            <span style={{ fontSize: 24 }}>🏷️</span>
                          </div>

                          <input
                            ref={inputRef}
                            type="text"
                            value={accessCode}
                            onChange={(e) => {
                              setAccessCode(e.target.value.toUpperCase());
                              setCodeError("");
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleCodeSubmit()
                            }
                            placeholder="Ex: LUCAS123"
                            maxLength={20}
                            autoComplete="off"
                            autoCapitalize="characters"
                            style={{
                              width: "100%",
                              padding: "20px 20px 20px 60px",
                              borderRadius: 20,
                              border: `3px solid ${
                                codeError
                                  ? "#FF5630"
                                  : accessCode
                                  ? "#0052CC"
                                  : "#DBEAFE"
                              }`,
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: "clamp(20px, 2vw, 24px)",
                              fontWeight: 700,
                              color: "#1A2B5F",
                              letterSpacing: 2,
                              outline: "none",
                              background: "#ffffff",
                              boxSizing: "border-box",
                              transition: "border-color 0.2s",
                              boxShadow: codeError
                                ? "0 0 0 4px rgba(255,86,48,0.12)"
                                : accessCode
                                ? "0 0 0 4px rgba(0,82,204,0.1)"
                                : "0 3px 15px rgba(0,82,204,0.08)",
                            }}
                          />
                        </div>

                        <AnimatePresence>
                          {codeError && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2 mt-4 px-5 py-3 rounded-2xl"
                              style={{
                                background: "#FFF0EC",
                                border: "2px solid #FECDC3",
                              }}
                            >
                              <AlertCircle size={18} color="#FF5630" />
                              <p
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#FF5630",
                                }}
                              >
                                {codeError}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div
                        className="rounded-2xl p-5 flex items-start gap-3"
                        style={{
                          background: "#FFFBEB",
                          border: "2px solid #FDE68A",
                        }}
                      >
                        <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
                        <p
                          style={{
                            fontSize: 14,
                            color: "#78601A",
                            fontWeight: 400,
                            lineHeight: 1.6,
                          }}
                        >
                          Não sabe seu código? Peça para o seu terapeuta ou
                          responsável te ajudar!
                        </p>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={handleCodeSubmit}
                        className="w-full flex items-center justify-center gap-2 py-5 lg:py-6 rounded-2xl transition-all"
                        style={{
                          background:
                            accessCode.trim().length >= 3
                              ? "linear-gradient(135deg, #003884, #0065FF)"
                              : "#DBEAFE",
                          color:
                            accessCode.trim().length >= 3 ? "#fff" : "#93C5FD",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 18,
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          boxShadow:
                            accessCode.trim().length >= 3
                              ? "0 8px 24px rgba(0,82,204,0.35)"
                              : "none",
                          transition: "all 0.25s ease",
                        }}
                      >
                        Continuar
                        <ChevronRight size={22} />
                      </motion.button>
                    </motion.div>
                  )}

                  {step === "pin" && (
                    <motion.div
                      key="pin-desktop"
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 28 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center space-y-7 lg:space-y-8"
                    >
                      <div className="text-center">
                        <h1
                          style={{
                            fontSize: "clamp(30px, 3vw, 36px)",
                            fontWeight: 800,
                            color: "#1A2B5F",
                            marginBottom: 12,
                          }}
                        >
                          Quase lá! 🔐
                        </h1>
                        <p
                          style={{
                            fontSize: 16,
                            color: "#6B7A99",
                            fontWeight: 400,
                          }}
                        >
                          Agora digite sua senha de 4 dígitos
                        </p>
                      </div>

                      <div
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl"
                        style={{
                          background: "#EBF3FF",
                          border: "2px solid #DBEAFE",
                        }}
                      >
                        <span style={{ fontSize: 22 }}>🏷️</span>
                        <div>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#6B7A99",
                              fontWeight: 500,
                            }}
                          >
                            Código de acesso
                          </p>
                          <p
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: "#0052CC",
                              letterSpacing: 2,
                              wordBreak: "break-word",
                            }}
                          >
                            {accessCode}
                          </p>
                        </div>
                      </div>

                      <div
                        className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, #003884, #0065FF)",
                        }}
                      >
                        <Lock size={36} color="white" strokeWidth={1.8} />
                      </div>

                      <motion.div
                        animate={
                          shake
                            ? { x: [-12, 12, -12, 12, -6, 6, 0] }
                            : { x: 0 }
                        }
                        transition={{ duration: 0.42 }}
                        className="flex gap-3 lg:gap-5"
                      >
                        {[0, 1, 2, 3].map((i) => {
                          const filled = i < pin.length;
                          const isSuccess = success && filled;
                          return (
                            <motion.div
                              key={i}
                              animate={
                                filled ? { scale: [1, 1.25, 1] } : { scale: 1 }
                              }
                              transition={{ duration: 0.18 }}
                              className="rounded-3xl flex items-center justify-center"
                              style={{
                                width: "clamp(64px, 7vw, 80px)",
                                height: "clamp(64px, 7vw, 80px)",
                                background: isSuccess
                                  ? "#36B37E"
                                  : filled
                                  ? pinError
                                    ? "#FF5630"
                                    : "#0052CC"
                                  : "#ffffff",
                                border: `4px solid ${
                                  isSuccess
                                    ? "#36B37E"
                                    : filled
                                    ? pinError
                                      ? "#FF5630"
                                      : "#0052CC"
                                    : "#DBEAFE"
                                }`,
                                boxShadow: filled
                                  ? `0 6px 20px ${
                                      pinError
                                        ? "rgba(255,86,48,0.35)"
                                        : isSuccess
                                        ? "rgba(54,179,126,0.4)"
                                        : "rgba(0,82,204,0.32)"
                                    }`
                                  : "0 3px 12px rgba(0,82,204,0.08)",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {filled && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="rounded-full"
                                  style={{
                                    width: isSuccess ? 26 : 22,
                                    height: isSuccess ? 26 : 22,
                                    background: "#ffffff",
                                  }}
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>

                      <AnimatePresence mode="wait">
                        {pinError && (
                          <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl"
                            style={{
                              background: "#FFF0EC",
                              border: "2px solid #FECDC3",
                            }}
                          >
                            <AlertCircle size={18} color="#FF5630" />
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#FF5630",
                              }}
                            >
                              Senha errada! Tente de novo 🙈
                            </p>
                          </motion.div>
                        )}

                        {success && (
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl"
                            style={{
                              background: "#ECFDF5",
                              border: "2px solid #A7F3D0",
                            }}
                          >
                            <span style={{ fontSize: 24 }}>✅</span>
                            <p
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#36B37E",
                              }}
                            >
                              Entrando... 🚀
                            </p>
                          </motion.div>
                        )}

                        {!pinError && !success && (
                          <motion.p
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              fontSize: 14,
                              color: "#B0BAD3",
                              fontWeight: 400,
                            }}
                          >
                            {pin.length === 0
                              ? "Toque nos números abaixo 👇"
                              : `${4 - pin.length} número${
                                  4 - pin.length !== 1 ? "s" : ""
                                } restante${4 - pin.length !== 1 ? "s" : ""}...`}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 14,
                          width: "100%",
                          maxWidth: 380,
                        }}
                      >
                        {digits.map((d, idx) => {
                          if (d === "") return <div key={idx} />;
                          const isDelete = d === "⌫";

                          return (
                            <motion.button
                              key={idx}
                              whileTap={{ scale: 0.88 }}
                              onClick={() =>
                                isDelete ? handleBackspace() : handleDigit(d)
                              }
                              disabled={success}
                              className="flex items-center justify-center rounded-3xl"
                              style={{
                                height: "clamp(68px, 8vw, 80px)",
                                background: isDelete ? "#EBF3FF" : "#ffffff",
                                border: "3px solid #DBEAFE",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "clamp(26px, 2.6vw, 30px)",
                                fontWeight: 700,
                                color: isDelete ? "#6B7A99" : "#1A2B5F",
                                cursor: success ? "default" : "pointer",
                                boxShadow: "0 4px 14px rgba(0,82,204,0.08)",
                                opacity: success ? 0.5 : 1,
                                transition: "opacity 0.2s",
                              }}
                            >
                              {isDelete ? (
                                <Delete size={28} color="#6B7A99" />
                              ) : (
                                d
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      <p
                        style={{
                          fontSize: 12,
                          color: "#C8D0E0",
                          fontWeight: 400,
                          textAlign: "center",
                        }}
                      >
                        🔒 Seu terapeuta te deu a senha de 4 dígitos
                      </p>

                      <button
                        onClick={goToCodeStep}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 14,
                          color: "#6B7A99",
                          fontWeight: 500,
                          textDecoration: "underline",
                        }}
                      >
                        Voltar para código de acesso
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div
            className="md:hidden flex flex-col flex-1 relative overflow-hidden"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <div className="relative z-10 px-6 pt-14 pb-6">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mb-7"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,82,204,0.1)" }}
                >
                  <ArrowLeft size={18} color="#0052CC" />
                </div>
                <span
                  style={{ fontSize: 13, color: "#6B7A99", fontWeight: 400 }}
                >
                  Voltar
                </span>
              </button>

              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #003884 0%, #0065FF 100%)",
                  }}
                >
                  <span style={{ fontSize: 32 }}>🎙️</span>
                </div>

                <div>
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={step}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: "#1A2B5F",
                        lineHeight: 1.15,
                      }}
                    >
                      {step === "code" ? "Olá! 👋" : "Quase lá! 🔐"}
                    </motion.h1>
                  </AnimatePresence>

                  <p
                    style={{
                      fontSize: 14,
                      color: "#6B7A99",
                      fontWeight: 400,
                      marginTop: 3,
                    }}
                  >
                    {step === "code"
                      ? "Digite seu código de acesso"
                      : "Agora digite sua senha de 4 dígitos"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5">
                {(["code", "pin"] as Step[]).map((s, i) => (
                  <div
                    key={s}
                    className="rounded-full transition-all duration-400"
                    style={{
                      height: 6,
                      width: step === s ? 32 : 12,
                      background:
                        step === s
                          ? "#0052CC"
                          : i === 0 && step === "pin"
                          ? "#36B37E"
                          : "#DBEAFE",
                      transition: "all 0.35s ease",
                    }}
                  />
                ))}
                <span
                  style={{
                    fontSize: 11,
                    color: "#B0BAD3",
                    fontWeight: 500,
                    marginLeft: 4,
                  }}
                >
                  Etapa {step === "code" ? "1" : "2"} de 2
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto relative z-10">
              <AnimatePresence mode="wait">
                {step === "code" && (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0, x: -28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }}
                    transition={{ duration: 0.25 }}
                    className="px-6 flex flex-col gap-6 pb-10"
                  >
                    <div
                      className="rounded-3xl p-5 flex items-center gap-4"
                      style={{
                        background: "#EBF3FF",
                        border: "1.5px solid #DBEAFE",
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#0052CC" }}
                      >
                        <User size={26} color="white" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1A2B5F",
                          }}
                        >
                          Código de acesso
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#6B7A99",
                            fontWeight: 400,
                            lineHeight: 1.5,
                          }}
                        >
                          Seu terapeuta te deu este código. É como seu nome de
                          usuário!
                        </p>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#1A2B5F",
                          display: "block",
                          marginBottom: 8,
                          letterSpacing: 0.3,
                        }}
                      >
                        SEU CÓDIGO DE ACESSO
                      </label>

                      <div className="relative">
                        <div
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                          style={{ pointerEvents: "none" }}
                        >
                          <span style={{ fontSize: 20 }}>🏷️</span>
                        </div>

                        <input
                          ref={inputRef}
                          type="text"
                          value={accessCode}
                          onChange={(e) => {
                            setAccessCode(e.target.value.toUpperCase());
                            setCodeError("");
                          }}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleCodeSubmit()
                          }
                          placeholder="Ex: LUCAS123"
                          maxLength={20}
                          autoComplete="off"
                          autoCapitalize="characters"
                          style={{
                            width: "100%",
                            padding: "17px 18px 17px 50px",
                            borderRadius: 18,
                            border: `2.5px solid ${
                              codeError
                                ? "#FF5630"
                                : accessCode
                                ? "#0052CC"
                                : "#DBEAFE"
                            }`,
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: 20,
                            fontWeight: 700,
                            color: "#1A2B5F",
                            letterSpacing: 2,
                            outline: "none",
                            background: "#ffffff",
                            boxSizing: "border-box",
                            transition: "border-color 0.2s",
                            boxShadow: codeError
                              ? "0 0 0 3px rgba(255,86,48,0.12)"
                              : accessCode
                              ? "0 0 0 3px rgba(0,82,204,0.1)"
                              : "0 2px 10px rgba(0,82,204,0.06)",
                          }}
                        />
                      </div>

                      <AnimatePresence>
                        {codeError && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-2xl"
                            style={{
                              background: "#FFF0EC",
                              border: "1.5px solid #FECDC3",
                            }}
                          >
                            <AlertCircle size={15} color="#FF5630" />
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#FF5630",
                              }}
                            >
                              {codeError}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div
                      className="rounded-2xl p-4 flex items-start gap-3"
                      style={{
                        background: "#FFFBEB",
                        border: "1.5px solid #FDE68A",
                      }}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#78601A",
                          fontWeight: 400,
                          lineHeight: 1.6,
                        }}
                      >
                        Não sabe seu código? Peça para o seu terapeuta ou
                        responsável te ajudar!
                      </p>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleCodeSubmit}
                      className="flex items-center justify-center gap-2 py-5 rounded-2xl transition-all"
                      style={{
                        background:
                          accessCode.trim().length >= 3
                            ? "linear-gradient(135deg, #003884, #0065FF)"
                            : "#DBEAFE",
                        color: accessCode.trim().length >= 3 ? "#fff" : "#93C5FD",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 17,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow:
                          accessCode.trim().length >= 3
                            ? "0 6px 20px rgba(0,82,204,0.35)"
                            : "none",
                        transition: "all 0.25s ease",
                      }}
                    >
                      Continuar
                      <ChevronRight size={20} />
                    </motion.button>
                  </motion.div>
                )}

                {step === "pin" && (
                  <motion.div
                    key="pin"
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 28 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center px-6 pb-10 gap-6"
                  >
                    <div
                      className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                      style={{
                        background: "#EBF3FF",
                        border: "2px solid #DBEAFE",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🏷️</span>
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#6B7A99",
                            fontWeight: 500,
                          }}
                        >
                          Código de acesso
                        </p>
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#0052CC",
                            letterSpacing: 2,
                          }}
                        >
                          {accessCode}
                        </p>
                      </div>
                    </div>

                    <div
                      className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #003884, #0065FF)",
                      }}
                    >
                      <Lock size={28} color="white" strokeWidth={1.8} />
                    </div>

                    <motion.div
                      animate={
                        shake
                          ? { x: [-10, 10, -10, 10, -5, 5, 0] }
                          : { x: 0 }
                      }
                      transition={{ duration: 0.42 }}
                      className="flex gap-4"
                    >
                      {[0, 1, 2, 3].map((i) => {
                        const filled = i < pin.length;
                        const isSuccess = success && filled;
                        return (
                          <motion.div
                            key={i}
                            animate={
                              filled ? { scale: [1, 1.25, 1] } : { scale: 1 }
                            }
                            transition={{ duration: 0.18 }}
                            className="rounded-2xl flex items-center justify-center"
                            style={{
                              width: 64,
                              height: 64,
                              background: isSuccess
                                ? "#36B37E"
                                : filled
                                ? pinError
                                  ? "#FF5630"
                                  : "#0052CC"
                                : "#ffffff",
                              border: `3px solid ${
                                isSuccess
                                  ? "#36B37E"
                                  : filled
                                  ? pinError
                                    ? "#FF5630"
                                    : "#0052CC"
                                  : "#DBEAFE"
                              }`,
                              boxShadow: filled
                                ? `0 4px 16px ${
                                    pinError
                                      ? "rgba(255,86,48,0.3)"
                                      : isSuccess
                                      ? "rgba(54,179,126,0.35)"
                                      : "rgba(0,82,204,0.28)"
                                  }`
                                : "0 2px 8px rgba(0,82,204,0.06)",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {filled && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="rounded-full"
                                style={{
                                  width: isSuccess ? 22 : 18,
                                  height: isSuccess ? 22 : 18,
                                  background: "#ffffff",
                                }}
                              />
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {pinError && (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 px-5 py-3 rounded-2xl"
                          style={{
                            background: "#FFF0EC",
                            border: "1.5px solid #FECDC3",
                          }}
                        >
                          <AlertCircle size={16} color="#FF5630" />
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#FF5630",
                            }}
                          >
                            Senha errada! Tente de novo 🙈
                          </p>
                        </motion.div>
                      )}

                      {success && (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 px-5 py-3 rounded-2xl"
                          style={{
                            background: "#ECFDF5",
                            border: "1.5px solid #A7F3D0",
                          }}
                        >
                          <span style={{ fontSize: 20 }}>✅</span>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#36B37E",
                            }}
                          >
                            Entrando... 🚀
                          </p>
                        </motion.div>
                      )}

                      {!pinError && !success && (
                        <motion.p
                          key="hint"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            fontSize: 13,
                            color: "#B0BAD3",
                            fontWeight: 400,
                          }}
                        >
                          {pin.length === 0
                            ? "Toque nos números abaixo 👇"
                            : `${4 - pin.length} número${
                                4 - pin.length !== 1 ? "s" : ""
                              } restante${4 - pin.length !== 1 ? "s" : ""}...`}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 12,
                        width: "100%",
                        maxWidth: 300,
                      }}
                    >
                      {digits.map((d, idx) => {
                        if (d === "") return <div key={idx} />;
                        const isDelete = d === "⌫";

                        return (
                          <motion.button
                            key={idx}
                            whileTap={{ scale: 0.85 }}
                            onClick={() =>
                              isDelete ? handleBackspace() : handleDigit(d)
                            }
                            disabled={success}
                            className="flex items-center justify-center rounded-3xl"
                            style={{
                              height: 70,
                              background: isDelete ? "#EBF3FF" : "#ffffff",
                              border: "2.5px solid #DBEAFE",
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: 26,
                              fontWeight: 700,
                              color: isDelete ? "#6B7A99" : "#1A2B5F",
                              cursor: success ? "default" : "pointer",
                              boxShadow: "0 3px 10px rgba(0,82,204,0.07)",
                              opacity: success ? 0.5 : 1,
                              transition: "opacity 0.2s",
                            }}
                          >
                            {isDelete ? (
                              <Delete size={24} color="#6B7A99" />
                            ) : (
                              d
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    <p
                      style={{
                        fontSize: 11,
                        color: "#C8D0E0",
                        fontWeight: 400,
                        textAlign: "center",
                      }}
                    >
                      🔒 Seu terapeuta te deu a senha de 4 dígitos
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}
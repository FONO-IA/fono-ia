import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MobileWrapper } from "../../MobileWrapper";
import { LogOut, ArrowLeft, ShieldCheck, Clock } from "lucide-react";

const BLUE = "#0052CC";

export function SettingsSair() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate("/");
      return;
    }
    const timer = setTimeout(
      () => setCountdown((c) => (c !== null ? c - 1 : null)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  const handleConfirm = () => {
    setConfirmed(true);
    setCountdown(3);
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
        {/* Desktop */}
        <div className="hidden md:flex md:flex-col md:flex-1 min-h-screen">
          {/* Header */}
          <div
            className="px-8 lg:px-12 xl:px-16 py-6 border-b border-gray-200"
            style={{ background: "#fff" }}
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => navigate("/admin")}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:bg-gray-100 flex-shrink-0"
                  style={{
                    background: "#F4F7FF",
                    border: "2px solid #DBEAFE",
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={20} color={BLUE} />
                </button>

                <div className="min-w-0">
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#1A2B5F",
                      lineHeight: 1.2,
                    }}
                  >
                    Sair da conta
                  </h1>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#6B7A99",
                      fontWeight: 400,
                      marginTop: 4,
                    }}
                  >
                    Sua sessão será encerrada com segurança
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-8 lg:px-12 xl:px-16 py-10">
            <div className="max-w-5xl mx-auto">
              {!confirmed ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-8 items-center"
                >
                  {/* Left visual */}
                  <div
                    className="rounded-[32px] p-8 flex flex-col items-center text-center"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 6px 24px rgba(0,82,204,0.06)",
                    }}
                  >
                    <div
                      className="w-32 h-32 rounded-[28px] flex items-center justify-center shadow-lg mb-6"
                      style={{
                        background: "linear-gradient(135deg, #FFF0EC, #FFE0D5)",
                      }}
                    >
                      <LogOut size={58} color="#FF5630" strokeWidth={1.5} />
                    </div>

                    <h2
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#1A2B5F",
                        marginBottom: 10,
                      }}
                    >
                      Deseja sair?
                    </h2>

                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 400,
                        color: "#6B7A99",
                        lineHeight: 1.7,
                      }}
                    >
                      Você será desconectado da sua conta.
                      <br />
                      Nenhum dado será perdido.
                    </p>
                  </div>

                  {/* Right content */}
                  <div
                    className="rounded-[32px] p-8 lg:p-10"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 6px 24px rgba(0,82,204,0.06)",
                    }}
                  >
                    <div className="mb-6">
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#6B7A99",
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        Segurança da sessão
                      </p>
                      <h3
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#1A2B5F",
                          lineHeight: 1.3,
                        }}
                      >
                        Encerrar acesso neste dispositivo
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                      {[
                        {
                          icon: <ShieldCheck size={18} color="#36B37E" />,
                          title: "Dados protegidos",
                          text: "Seus dados continuam salvos e seguros",
                          bg: "#ECFDF5",
                          border: "#A7F3D0",
                        },
                        {
                          icon: <Clock size={18} color={BLUE} />,
                          title: "Sessão ativa",
                          text: "2h 34min | Dr. Paulo Andrade",
                          bg: "#EBF3FF",
                          border: "#93C5FD",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="rounded-2xl p-5"
                          style={{
                            background: item.bg,
                            border: `1.5px solid ${item.border}`,
                          }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {item.icon}
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#1A2B5F",
                              }}
                            >
                              {item.title}
                            </p>
                          </div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 400,
                              color: "#4F5D7A",
                              lineHeight: 1.5,
                            }}
                          >
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleConfirm}
                        className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-95"
                        style={{
                          background:
                            "linear-gradient(135deg, #FF5630, #FF7452)",
                          color: "#fff",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 16,
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 6px 20px rgba(255,86,48,0.35)",
                        }}
                      >
                        <LogOut size={20} />
                        Sim, sair agora
                      </button>

                      <button
                        onClick={() => navigate("/admin")}
                        className="sm:min-w-[180px] py-4 px-6 rounded-2xl transition-all hover:bg-gray-50"
                        style={{
                          background: "#ffffff",
                          color: "#1A2B5F",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 15,
                          fontWeight: 600,
                          border: "2px solid #DBEAFE",
                          cursor: "pointer",
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="max-w-3xl mx-auto"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18 }}
                >
                  <div
                    className="rounded-[32px] p-8 lg:p-10"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 6px 24px rgba(0,82,204,0.06)",
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 items-center">
                      {/* Countdown */}
                      <div className="flex flex-col items-center">
                        <div className="relative flex items-center justify-center">
                          <svg width={150} height={150} viewBox="0 0 120 120">
                            <circle
                              cx={60}
                              cy={60}
                              r={54}
                              fill="none"
                              stroke="#DBEAFE"
                              strokeWidth={8}
                            />
                            <motion.circle
                              cx={60}
                              cy={60}
                              r={54}
                              fill="none"
                              stroke={BLUE}
                              strokeWidth={8}
                              strokeLinecap="round"
                              strokeDasharray={339.3}
                              initial={{ strokeDashoffset: 0 }}
                              animate={{ strokeDashoffset: 339.3 }}
                              transition={{ duration: 3, ease: "linear" }}
                              style={{
                                transform: "rotate(-90deg)",
                                transformOrigin: "60px 60px",
                              }}
                            />
                          </svg>

                          <div className="absolute flex flex-col items-center">
                            <span
                              style={{
                                fontSize: 38,
                                fontWeight: 800,
                                color: BLUE,
                              }}
                            >
                              {countdown}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: "#6B7A99",
                                fontWeight: 400,
                              }}
                            >
                              segundos
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Text */}
                      <div>
                        <h2
                          style={{
                            fontSize: 30,
                            fontWeight: 700,
                            color: "#1A2B5F",
                            marginBottom: 10,
                            lineHeight: 1.2,
                          }}
                        >
                          Encerrando sessão...
                        </h2>

                        <p
                          style={{
                            fontSize: 15,
                            color: "#6B7A99",
                            fontWeight: 400,
                            lineHeight: 1.7,
                            marginBottom: 20,
                          }}
                        >
                          Você será redirecionado para a tela de login em{" "}
                          {countdown} segundo{countdown !== 1 ? "s" : ""}.
                        </p>

                        <div
                          className="flex items-center gap-3 px-4 py-4 rounded-2xl mb-5"
                          style={{
                            background: "#ECFDF5",
                            border: "1.5px solid #A7F3D0",
                          }}
                        >
                          <ShieldCheck size={18} color="#36B37E" />
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#065F46",
                            }}
                          >
                            Sessão encerrada com segurança
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setConfirmed(false);
                            setCountdown(null);
                          }}
                          className="px-8 py-3.5 rounded-2xl transition-all hover:bg-gray-50"
                          style={{
                            background: "#ffffff",
                            color: "#6B7A99",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: 14,
                            fontWeight: 500,
                            border: "2px solid #DBEAFE",
                            cursor: "pointer",
                          }}
                        >
                          Cancelar saída
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div
          className="md:hidden flex flex-col flex-1"
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: "#F4F7FF",
          }}
        >
          {/* Header */}
          <div
            className="px-6 pt-14 pb-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(150deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
            }}
          >
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
              style={{ background: "#fff" }}
            />
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 mb-4 relative z-10"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <ArrowLeft size={16} color="white" />
              </div>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 400,
                }}
              >
                Configurações
              </span>
            </button>
            <h1
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Sair da conta
            </h1>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 400,
                marginTop: 3,
              }}
            >
              Sua sessão será encerrada com segurança
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            {!confirmed ? (
              <motion.div
                className="w-full flex flex-col items-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #FFF0EC, #FFE0D5)",
                  }}
                >
                  <LogOut size={52} color="#FF5630" strokeWidth={1.5} />
                </div>

                <div className="text-center">
                  <h2
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#1A2B5F",
                      marginBottom: 8,
                    }}
                  >
                    Deseja sair?
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 14,
                      fontWeight: 400,
                      color: "#6B7A99",
                      lineHeight: 1.6,
                    }}
                  >
                    Você será desconectado da sua conta.
                    <br />
                    Nenhum dado será perdido.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  {[
                    {
                      icon: <ShieldCheck size={16} color="#36B37E" />,
                      text: "Seus dados continuam salvos e seguros",
                      bg: "#ECFDF5",
                      border: "#A7F3D0",
                    },
                    {
                      icon: <Clock size={16} color={BLUE} />,
                      text: "Sessão ativa: 2h 34min | Dr. Paulo Andrade",
                      bg: "#EBF3FF",
                      border: "#93C5FD",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{
                        background: item.bg,
                        border: `1.5px solid ${item.border}`,
                      }}
                    >
                      {item.icon}
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 13,
                          fontWeight: 400,
                          color: "#1A2B5F",
                        }}
                      >
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="w-full flex flex-col gap-3 mt-2">
                  <button
                    onClick={handleConfirm}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #FF5630, #FF7452)",
                      color: "#fff",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(255,86,48,0.35)",
                    }}
                  >
                    <LogOut size={20} />
                    Sim, sair agora
                  </button>
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full py-4 rounded-2xl transition-all active:scale-95"
                    style={{
                      background: "#ffffff",
                      color: "#1A2B5F",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      border: "2px solid #DBEAFE",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center gap-6 w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
              >
                <div className="relative flex items-center justify-center">
                  <svg width={120} height={120} viewBox="0 0 120 120">
                    <circle
                      cx={60}
                      cy={60}
                      r={54}
                      fill="none"
                      stroke="#DBEAFE"
                      strokeWidth={8}
                    />
                    <motion.circle
                      cx={60}
                      cy={60}
                      r={54}
                      fill="none"
                      stroke={BLUE}
                      strokeWidth={8}
                      strokeLinecap="round"
                      strokeDasharray={339.3}
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: 339.3 }}
                      transition={{ duration: 3, ease: "linear" }}
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "60px 60px",
                      }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 32,
                        fontWeight: 800,
                        color: BLUE,
                      }}
                    >
                      {countdown}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 11,
                        color: "#6B7A99",
                        fontWeight: 400,
                      }}
                    >
                      segundos
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <h2
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#1A2B5F",
                      marginBottom: 6,
                    }}
                  >
                    Encerrando sessão...
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 14,
                      color: "#6B7A99",
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    Você será redirecionado para a tela de login em {countdown}{" "}
                    segundo{countdown !== 1 ? "s" : ""}.
                  </p>
                </div>

                <div
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: "#ECFDF5",
                    border: "1.5px solid #A7F3D0",
                  }}
                >
                  <ShieldCheck size={18} color="#36B37E" />
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#065F46",
                    }}
                  >
                    Sessão encerrada com segurança
                  </p>
                </div>

                <button
                  onClick={() => {
                    setConfirmed(false);
                    setCountdown(null);
                  }}
                  className="px-8 py-3 rounded-2xl transition-all active:scale-95"
                  style={{
                    background: "#ffffff",
                    color: "#6B7A99",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    border: "2px solid #DBEAFE",
                    cursor: "pointer",
                  }}
                >
                  Cancelar saída
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}

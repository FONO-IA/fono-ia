import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { Eye, EyeOff, ChevronRight, Hash } from "lucide-react";

export function EntryPortal() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activePortal, setActivePortal] = useState<"pro" | "patient" | null>(null);

  const handleProfessionalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin");
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 md:h-full overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 md:-top-40 md:-right-40 w-64 h-64 md:w-[600px] md:h-[600px] rounded-full opacity-20"
          style={{ background: "#0052CC" }}
        />
        <div
          className="absolute top-10 -left-10 md:top-1/3 md:-left-32 w-40 h-40 md:w-96 md:h-96 rounded-full opacity-10"
          style={{ background: "#0052CC" }}
        />
        <div
          className="absolute bottom-20 right-1/4 hidden md:block w-80 h-80 rounded-full opacity-8"
          style={{ background: "#0052CC" }}
        />
      </div>

      <div className="flex flex-col md:flex-row flex-1 md:h-screen relative z-10">
        {/* Left side - Desktop only branding */}
        <div className="hidden md:flex md:w-1/2 lg:w-2/5 flex-col items-center justify-center p-12 lg:p-20 relative">
          <div className="max-w-lg">
            {/* CORREÇÃO: Container da Logo Desktop */}
            <div
              className="w-28 h-28 lg:w-32 lg:h-32 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl overflow-hidden"
              style={{ background: "#0052CC" }}
            >
              <img
                src="https://res.cloudinary.com/dqkpkmicx/image/upload/q_auto/f_auto/v1775585373/logo_fono_ia_ppzb2r.png"
                alt="Logo Fono IA"
                className="w-full h-full object-cover"
              />
            </div>

            <h1
              className="tracking-wide mb-4"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 56,
                fontWeight: 700,
                color: "#0052CC",
                letterSpacing: 3,
                lineHeight: 1.1,
              }}
            >
              FONO
              <span style={{ color: "#003884" }}>-IA</span>
            </h1>

            <p
              className="text-xl mb-8"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 400,
                color: "#6B7A99",
                letterSpacing: 0.5,
                lineHeight: 1.6,
              }}
            >
              Tecnologia de voz para fonoaudiologia
            </p>

            <div className="space-y-4 mt-12">
              {[
                { icon: "🎙️", text: "Análise de fala com IA" },
                { icon: "📊", text: "Acompanhamento em tempo real" },
                { icon: "🎯", text: "Exercícios personalizados" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "#EBF3FF" }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 500, color: "#1A2B5F" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Forms */}
        <div className="flex flex-col flex-1 md:w-1/2 lg:w-3/5 md:items-center md:justify-center md:bg-white/40 md:backdrop-blur-sm overflow-y-auto px-6 md:px-12 lg:px-20 pt-16 md:pt-0 pb-8">
          <div className="w-full max-w-md md:py-12">
            {/* Logo Section - Mobile only */}
            <div className="flex flex-col items-center mb-10 md:hidden">
              {/* CORREÇÃO: Container da Logo Mobile */}
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-lg overflow-hidden"
                style={{ background: "#0052CC" }}
              >
                <img
                  src="https://res.cloudinary.com/dqkpkmicx/image/upload/q_auto/f_auto/v1775585373/logo_fono_ia_ppzb2r.png"
                  alt="Logo Fono IA"
                  className="w-full h-full object-cover"
                />
              </div>

              <h1
                className="tracking-wide mb-1"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#0052CC",
                  letterSpacing: 2,
                }}
              >
                FONO
                <span style={{ color: "#003884" }}>-IA</span>
              </h1>

              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "#6B7A99",
                  letterSpacing: 0.5,
                }}
              >
                Tecnologia de voz para fonoaudiologia
              </p>
            </div>

            {/* Portal toggle */}
            <div
              className="flex rounded-2xl p-1 mb-6"
              style={{ background: "#EBF3FF" }}
            >
              <button
                onClick={() => setActivePortal("pro")}
                className="flex-1 py-3 md:py-4 rounded-xl transition-all duration-200"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  background:
                    activePortal === "pro" || activePortal === null
                      ? "#0052CC"
                      : "transparent",
                  color:
                    activePortal === "pro" || activePortal === null
                      ? "#fff"
                      : "#6B7A99",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Profissional
              </button>

              <button
                onClick={() => setActivePortal("patient")}
                className="flex-1 py-3 md:py-4 rounded-xl transition-all duration-200"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  background: activePortal === "patient" ? "#0052CC" : "transparent",
                  color: activePortal === "patient" ? "#fff" : "#6B7A99",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Paciente
              </button>
            </div>

            {/* Professional Portal Card */}
            {(activePortal === null || activePortal === "pro") && (
              <div
                className="rounded-3xl p-6 md:p-8 mb-4 shadow-md md:shadow-xl"
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #DBEAFE",
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "#EBF3FF" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14a6 6 0 0112 0v1H4v-1z"
                        fill="#0052CC"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1A2B5F",
                        lineHeight: 1.2,
                      }}
                    >
                      Portal Profissional
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        color: "#6B7A99",
                        fontWeight: 400,
                      }}
                    >
                      Acesso para fonoaudiólogos
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfessionalLogin} className="flex flex-col gap-4">
                  <div>
                    <label
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#1A2B5F",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      E-mail
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="dr.paulo@clinica.com"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 14,
                        border: "2px solid #DBEAFE",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 14,
                        fontWeight: 400,
                        color: "#1A2B5F",
                        outline: "none",
                        background: "#FAFCFF",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#0052CC")}
                      onBlur={(e) => (e.target.style.borderColor = "#DBEAFE")}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#1A2B5F",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Senha
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          padding: "12px 44px 12px 16px",
                          borderRadius: 14,
                          border: "2px solid #DBEAFE",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 14,
                          fontWeight: 400,
                          color: "#1A2B5F",
                          outline: "none",
                          background: "#FAFCFF",
                          boxSizing: "border-box",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#0052CC")}
                        onBlur={(e) => (e.target.style.borderColor = "#DBEAFE")}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="#6B7A99" />
                        ) : (
                          <Eye size={18} color="#6B7A99" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#0052CC",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-200 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #0052CC, #0065FF)",
                      color: "#fff",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(0,82,204,0.35)",
                    }}
                  >
                    Entrar
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/cadastro-fono")}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl transition-all duration-200 active:scale-95"
                    style={{
                      background: "#F4F7FF",
                      color: "#0052CC",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      border: "2px solid #DBEAFE",
                      cursor: "pointer",
                    }}
                  >
                    Fazer cadastro
                  </button>
                </form>
              </div>
            )}

            {/* Patient Portal Card */}
            {activePortal === "patient" && (
              <div
                className="rounded-3xl p-6 mb-4 shadow-md"
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #DBEAFE",
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "#FFF8E1" }}
                  >
                    <span style={{ fontSize: 20 }}>😊</span>
                  </div>

                  <div>
                    <h2
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1A2B5F",
                        lineHeight: 1.2,
                      }}
                    >
                      Portal do Paciente
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        color: "#6B7A99",
                        fontWeight: 400,
                      }}
                    >
                      Acesso simples e seguro
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 13,
                    fontWeight: 400,
                    color: "#6B7A99",
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  Entre com seu nome e PIN de 4 dígitos 🔑
                </p>

                <button
                  onClick={() => navigate("/child-login")}
                  className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 active:scale-95 w-full"
                  style={{
                    background: "linear-gradient(135deg, #0052CC, #0065FF)",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0,82,204,0.3)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    <Hash size={24} color="white" />
                  </div>

                  <div className="text-left flex-1">
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      Entrar com PIN
                    </p>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.75)",
                      }}
                    >
                      Selecione seu nome e digite o PIN
                    </p>
                  </div>

                  <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
                </button>
              </div>
            )}

            <div className="mt-auto pt-6 flex flex-col items-center gap-1">
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 11,
                  color: "#B0BAD3",
                  fontWeight: 400,
                }}
              >
                © 2026 FONO-IA · Todos os direitos reservados
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 11,
                  color: "#B0BAD3",
                  fontWeight: 400,
                }}
              >
                Dados protegidos pela LGPD
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}
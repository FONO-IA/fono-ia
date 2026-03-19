import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Calendar,
  Award,
  Mic,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const speechData = [
  { week: "Sem 1", accuracy: 32 },
  { week: "Sem 2", accuracy: 41 },
  { week: "Sem 3", accuracy: 38 },
  { week: "Sem 4", accuracy: 55 },
  { week: "Sem 5", accuracy: 60 },
  { week: "Sem 6", accuracy: 68 },
  { week: "Sem 7", accuracy: 74 },
  { week: "Sem 8", accuracy: 82 },
];

const recordings = [
  {
    id: "FN05-001",
    word: "Maçã",
    date: "24 Fev 2026",
    time: "14:32",
    status: "success",
    score: 95,
    duration: "0:04",
  },
  {
    id: "FN05-002",
    word: "Borboleta",
    date: "24 Fev 2026",
    time: "14:28",
    status: "success",
    score: 88,
    duration: "0:06",
  },
  {
    id: "FN05-003",
    word: "Sapato",
    date: "23 Fev 2026",
    time: "10:15",
    status: "retry",
    score: 52,
    duration: "0:05",
  },
  {
    id: "FN05-004",
    word: "Pássaro",
    date: "23 Fev 2026",
    time: "10:10",
    status: "retry",
    score: 41,
    duration: "0:07",
  },
  {
    id: "FN05-005",
    word: "Elefante",
    date: "21 Fev 2026",
    time: "15:00",
    status: "success",
    score: 79,
    duration: "0:05",
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0052CC",
          borderRadius: 12,
          padding: "8px 14px",
          boxShadow: "0 4px 12px rgba(0,82,204,0.25)",
        }}
      >
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 400, marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, color: "#fff", fontWeight: 700 }}>
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export function PatientProgress() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = (recId: string) => {
    setPlayingId(recId);
    setTimeout(() => setPlayingId(null), 2000);
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen" style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}>
        {/* Left Panel - Patient Info */}
        <div className="w-80 lg:w-96" style={{ background: "linear-gradient(180deg, #003884 0%, #0052CC 60%, #0065FF 100%)" }}>
          <div className="p-8">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 mb-8 transition-all hover:opacity-80"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <ArrowLeft size={20} color="rgba(255,255,255,0.85)" />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>Voltar ao Dashboard</span>
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}>LM</span>
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Lucas Mendes</h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>6 anos · Dislalia Funcional</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="space-y-3">
              {[
                { label: "Sessões Realizadas", value: "24", icon: Calendar },
                { label: "Melhor Resultado", value: "95%", icon: Award },
                { label: "Resultado Atual", value: "82%", icon: TrendingUp },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <s.icon size={18} color="#fff" />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigate("/exercise")}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{
                  background: "#fff",
                  color: "#0052CC",
                  fontSize: 15,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Mic size={20} />
                Iniciar Nova Sessão
              </button>
              <button
                className="w-full px-5 py-3.5 rounded-2xl transition-all hover:bg-white/10"
                style={{
                  background: "transparent",
                  border: "2px solid rgba(255,255,255,0.3)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Gerar Relatório Completo
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Charts and Data */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 lg:p-12 max-w-6xl">
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#1A2B5F", marginBottom: 8 }}>Evolução do Paciente</h2>
            <p style={{ fontSize: 15, color: "#6B7A99", fontWeight: 400, marginBottom: 32 }}>
              Acompanhamento detalhado de progresso e gravações
            </p>

            {/* Chart */}
            <div className="rounded-3xl p-8 shadow-sm mb-8" style={{ background: "#ffffff", border: "1.5px solid #DBEAFE" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1A2B5F" }}>Evolução da Fala</h3>
                  <p style={{ fontSize: 13, color: "#6B7A99", fontWeight: 400 }}>Precisão (%) nas últimas 8 semanas</p>
                </div>
                <div className="px-4 py-2 rounded-full flex items-center gap-1.5" style={{ background: "#ECFDF5" }}>
                  <TrendingUp size={14} color="#36B37E" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#36B37E" }}>+50%</span>
                </div>
              </div>

              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={speechData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="blueGradDesktop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0052CC" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#0052CC" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBF3FF" vertical={false} />
                    <XAxis
                      dataKey="week"
                      stroke="#B0BAD3"
                      style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fill: "#6B7A99" }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#B0BAD3"
                      style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fill: "#6B7A99" }}
                      tickLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#0052CC"
                      strokeWidth={3}
                      fill="url(#blueGradDesktop)"
                      dot={{ r: 5, fill: "#0052CC", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#0052CC", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recordings */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1A2B5F" }}>Gravações Recentes</h3>
                <span style={{ fontSize: 12, color: "#0052CC", fontWeight: 600, background: "#EBF3FF", padding: "6px 12px", borderRadius: 12 }}>
                  Código: FN05
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center gap-4 p-5 rounded-3xl transition-all hover:shadow-lg"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 2px 8px rgba(0,82,204,0.05)",
                    }}
                  >
                    {/* Play button */}
                    <button
                      onClick={() => handlePlay(rec.id)}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105"
                      style={{
                        background: playingId === rec.id ? "#0052CC" : "#EBF3FF",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {playingId === rec.id ? (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((b) => (
                            <div
                              key={b}
                              className="w-1 rounded-full"
                              style={{
                                height: 14 + b * 4,
                                background: "#fff",
                                animation: `bounce ${0.4 + b * 0.1}s ease-in-out infinite alternate`,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Play size={20} color="#0052CC" fill="#0052CC" />
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p style={{ fontSize: 16, fontWeight: 600, color: "#1A2B5F" }}>{rec.word}</p>
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "#EBF3FF", fontSize: 10, fontWeight: 500, color: "#0052CC" }}>
                          {rec.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mic size={11} color="#B0BAD3" />
                        <span style={{ fontSize: 12, color: "#B0BAD3", fontWeight: 400 }}>
                          {rec.date} · {rec.time} · {rec.duration}
                        </span>
                      </div>
                    </div>

                    {/* Score + Status */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        {rec.status === "success" ? (
                          <CheckCircle size={18} color="#36B37E" fill="#36B37E" />
                        ) : (
                          <RefreshCw size={16} color="#FFAB00" />
                        )}
                        <span style={{ fontSize: 14, fontWeight: 700, color: rec.status === "success" ? "#36B37E" : "#FFAB00" }}>
                          {rec.score}%
                        </span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, color: rec.status === "success" ? "#36B37E" : "#FFAB00" }}>
                        {rec.status === "success" ? "Aprovado" : "Repetir"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col flex-1 overflow-y-auto" style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}>
        <div
          className="px-6 md:px-8 pt-14 md:pt-16 pb-6 md:pb-7 relative overflow-hidden"
          style={{
            background: "linear-gradient(150deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
          }}
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 md:w-36 md:h-36 rounded-full opacity-10" style={{ background: "#fff" }} />

          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 mb-5"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <ArrowLeft size={20} color="rgba(255,255,255,0.85)" />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 400 }}>
              Voltar
            </span>
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <span className="md:text-2xl" style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>LM</span>
            </div>
            <div>
              <h1 className="md:text-2xl" style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                Lucas Mendes
              </h1>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>
                6 anos · Dislalia Funcional
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 md:gap-4 mt-5">
            {[
              { label: "Sessões", value: "24", icon: Calendar },
              { label: "Melhor", value: "95%", icon: Award },
              { label: "Atual", value: "82%", icon: TrendingUp },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-2xl p-3 flex flex-col gap-1"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <s.icon size={14} color="rgba(255,255,255,0.75)" />
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  {s.value}
                </p>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="px-6 mt-5">
          <div
            className="rounded-3xl p-5 shadow-sm"
            style={{ background: "#ffffff", border: "1.5px solid #DBEAFE" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 600, color: "#1A2B5F" }}>
                  Evolução da Fala
                </h2>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>
                  Precisão (%) nas últimas 8 semanas
                </p>
              </div>
              <div
                className="px-3 py-1 rounded-full flex items-center gap-1"
                style={{ background: "#ECFDF5" }}
              >
                <TrendingUp size={12} color="#36B37E" />
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 600, color: "#36B37E" }}>
                  +50%
                </span>
              </div>
            </div>

            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={speechData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052CC" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#0052CC" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBF3FF" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, fill: "#B0BAD3" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, fill: "#B0BAD3" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#0052CC"
                    strokeWidth={2.5}
                    fill="url(#blueGrad)"
                    dot={{ r: 4, fill: "#0052CC", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#0052CC", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recordings */}
        <div className="px-6 mt-5 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 600, color: "#1A2B5F" }}>
              Gravações Recentes
            </h2>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#0052CC", fontWeight: 500 }}>
              FN05
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #DBEAFE",
                  boxShadow: "0 2px 8px rgba(0,82,204,0.05)",
                }}
              >
                {/* Play button */}
                <button
                  onClick={() => handlePlay(rec.id)}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-90"
                  style={{
                    background: playingId === rec.id ? "#0052CC" : "#EBF3FF",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {playingId === rec.id ? (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((b) => (
                        <div
                          key={b}
                          className="w-1 rounded-full"
                          style={{
                            height: 14 + b * 4,
                            background: "#fff",
                            animation: `bounce ${0.4 + b * 0.1}s ease-in-out infinite alternate`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Play size={16} color="#0052CC" fill="#0052CC" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: "#1A2B5F" }}>
                      {rec.word}
                    </p>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        background: "#EBF3FF",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 9,
                        fontWeight: 500,
                        color: "#0052CC",
                      }}
                    >
                      {rec.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic size={10} color="#B0BAD3" />
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#B0BAD3", fontWeight: 400 }}>
                      {rec.date} · {rec.time} · {rec.duration}
                    </span>
                  </div>
                </div>

                {/* Score + Status */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    {rec.status === "success" ? (
                      <CheckCircle size={16} color="#36B37E" fill="#36B37E" />
                    ) : (
                      <RefreshCw size={14} color="#FFAB00" />
                    )}
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        color: rec.status === "success" ? "#36B37E" : "#FFAB00",
                      }}
                    >
                      {rec.score}%
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 10,
                      fontWeight: 500,
                      color: rec.status === "success" ? "#36B37E" : "#FFAB00",
                    }}
                  >
                    {rec.status === "success" ? "Aprovado" : "Repetir"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => navigate("/exercise")}
              className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #0052CC, #0065FF)",
                color: "#fff",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,82,204,0.3)",
              }}
            >
              <Mic size={18} />
              Iniciar Sessão
            </button>
            <button
              className="px-5 py-4 rounded-2xl"
              style={{
                background: "#ffffff",
                border: "2px solid #DBEAFE",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "#0052CC",
                cursor: "pointer",
              }}
            >
              Relatório
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: scaleY(0.6); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </MobileWrapper>
  );
}
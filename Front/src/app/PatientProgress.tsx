import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import {
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Calendar,
  Award,
  Mic,
  Plus,
  ClipboardList,
  UserRound,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { listarPacientes } from "../services/pacientes";
import { listarAtendimentos } from "../services/atendimentos";
import { listarExercicios, type Exercicio } from "../services/exercicios";

type ApiPaciente = {
  id: string;
  nome: string;
  data_nascimento: string;
  observacoes?: string;
  responsavel?: string;
  responsavel_nome?: string;
  total_exercicios?: number;
  exercicios_concluidos?: number;
  ultima_sessao?: string;
};

type ApiAtendimento = {
  id: string;
  paciente: string;
  paciente_nome?: string;
  fonoaudiologo?: string;
  fonoaudiologo_nome?: string;
  exercicio: string;
  exercicio_categoria?: string;
  exercicio_nivel?: string;
  observacoes?: string;
  concluido: boolean;
  created_at?: string;
  updated_at?: string;
};

type ChartPoint = {
  week: string;
  accuracy: number;
};

const calculatePatientAge = (birthDate: string) => {
  if (!birthDate) return 0;

  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : 0;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatDate = (date?: string) => {
  if (!date) return "Sem registro";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Sem registro";

  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date?: string) => {
  if (!date) return "--:--";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "--:--";

  return parsed.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getWeekLabel = (index: number) => `Sess ${index + 1}`;

const buildProgressData = (sessions: ApiAtendimento[]): ChartPoint[] => {
  if (!sessions.length) {
    return [{ week: "Sem dados", accuracy: 0 }];
  }

  const ordered = [...sessions]
    .sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
      const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
      return aTime - bTime;
    })
    .slice(-8);

  let completedCount = 0;

  return ordered.map((session, index) => {
    if (session.concluido) completedCount += 1;

    const accuracy = Math.round((completedCount / (index + 1)) * 100);

    return {
      week: getWeekLabel(index),
      accuracy,
    };
  });
};

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
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.75)",
            fontWeight: 400,
            marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 16,
            color: "#fff",
            fontWeight: 700,
          }}
        >
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

  const [patient, setPatient] = useState<ApiPaciente | null>(null);
  const [sessions, setSessions] = useState<ApiAtendimento[]>([]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatientDashboard() {
      try {
        setLoading(true);
        setError("");

        const patients = await listarPacientes();

        const found = patients.find(
          (item: ApiPaciente) => String(item.id) === String(id),
        );

        if (!found) {
          setError("Paciente não encontrado.");
          setPatient(null);
          setSessions([]);
          setExercicios([]);
          return;
        }

        setPatient(found);

        const [atendimentos, exerciciosData] = await Promise.all([
          listarAtendimentos({ paciente: String(found.id) }),
          listarExercicios({ paciente: String(found.id) }),
        ]);

        setSessions(atendimentos);
        setExercicios(exerciciosData);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Erro ao carregar relatório do paciente.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadPatientDashboard();
  }, [id]);

  const patientName = patient?.nome || "Paciente";
  const patientAge = patient?.data_nascimento
    ? calculatePatientAge(patient.data_nascimento)
    : 0;
  const patientInitials = patient?.nome ? getInitials(patient.nome) : "--";

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(
    (session) => session.concluido,
  ).length;
  const currentProgress =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;
  const bestResult =
    sessions.length > 0
      ? sessions.some((session) => session.concluido)
        ? 100
        : 0
      : 0;

  const latestSession = useMemo(() => {
    if (!sessions.length) return null;

    return [...sessions].sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
      const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
      return bTime - aTime;
    })[0];
  }, [sessions]);

  const progressData = useMemo(() => buildProgressData(sessions), [sessions]);

  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => {
        const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 6);
  }, [sessions]);

  if (loading) {
    return (
      <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
        <div
          className="flex items-center justify-center min-h-screen"
          style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
        >
          <p style={{ fontSize: 16, color: "#6B7A99" }}>
            Carregando relatório do paciente...
          </p>
        </div>
      </MobileWrapper>
    );
  }

  if (error || !patient) {
    return (
      <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
        <div
          className="flex items-center justify-center min-h-screen px-6"
          style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
        >
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #DBEAFE",
              borderRadius: 24,
              padding: 24,
              maxWidth: 420,
              width: "100%",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1A2B5F",
                marginBottom: 8,
              }}
            >
              Não foi possível abrir o paciente
            </p>
            <p style={{ fontSize: 14, color: "#6B7A99", marginBottom: 20 }}>
              {error || "Paciente não encontrado."}
            </p>
            <button
              onClick={() => navigate("/admin")}
              style={{
                background: "linear-gradient(135deg, #0052CC, #0065FF)",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "12px 18px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Voltar ao dashboard
            </button>
          </div>
        </div>
      </MobileWrapper>
    );
  }

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <>
        <div
          className="hidden md:flex h-screen"
          style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
        >
          <div
            className="w-80 lg:w-96"
            style={{
              background:
                "linear-gradient(180deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
            }}
          >
            <div className="p-8">
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 mb-8 transition-all hover:opacity-80"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <ArrowLeft size={20} color="rgba(255,255,255,0.85)" />
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 400,
                  }}
                >
                  Voltar ao Dashboard
                </span>
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <span
                    style={{ fontSize: 26, fontWeight: 700, color: "#fff" }}
                  >
                    {patientInitials}
                  </span>
                </div>
                <div>
                  <h1
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.2,
                    }}
                  >
                    {patientName}
                  </h1>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 400,
                    }}
                  >
                    {patientAge} anos
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Sessões Realizadas",
                    value: String(totalSessions),
                    icon: Calendar,
                  },
                  {
                    label: "Melhor Resultado",
                    value: `${bestResult}%`,
                    icon: Award,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      <s.icon size={18} color="#fff" />
                    </div>
                    <div className="flex-1">
                      <p
                        style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}
                      >
                        {s.value}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.7)",
                          fontWeight: 400,
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3">
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <UserRound size={16} color="#fff" />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                      Informações clínicas
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.8)",
                      marginBottom: 8,
                    }}
                  >
                    <strong>Responsável:</strong>{" "}
                    {patient.responsavel_nome || "Não informado"}
                  </p>

                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.8)",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>Observações:</strong>{" "}
                    {patient.observacoes?.trim() ||
                      "Sem observações clínicas registradas."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      navigate("/exercise", {
                        state: {
                          origem: "fono",
                          pacienteId: patient.id,
                        },
                      })
                    }
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{
                      background: "#fff",
                      color: "#0052CC",
                      fontSize: 15,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 10px 24px rgba(255,255,255,0.18)",
                    }}
                  >
                    <Mic size={20} />
                    Iniciar Sessão
                  </button>

                  <button
                    onClick={() =>
                      navigate("/add-exercise", {
                        state: { pacienteId: patient.id },
                      })
                    }
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #00A337, #00B561)",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 12px 28px rgba(54,179,126,0.28)",
                    }}
                  >
                    <Plus size={20} />
                    Criar Exercício
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-8 lg:p-12 max-w-6xl">
              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#1A2B5F",
                  marginBottom: 8,
                }}
              >
                Evolução do Paciente
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "#6B7A99",
                  fontWeight: 400,
                  marginBottom: 32,
                }}
              >
                Relatório clínico com base nos atendimentos registrados
              </p>

              <div
                className="rounded-3xl p-8 shadow-sm mb-8"
                style={{ background: "#ffffff", border: "1.5px solid #DBEAFE" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#1A2B5F",
                      }}
                    >
                      Evolução terapêutica
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#6B7A99",
                        fontWeight: 400,
                      }}
                    >
                      Taxa acumulada de sessões concluídas nas últimas 8 sessões
                    </p>
                  </div>
                  <div
                    className="px-4 py-2 rounded-full flex items-center gap-1.5"
                    style={{ background: "#ECFDF5" }}
                  >
                    <TrendingUp size={14} color="#36B37E" />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#36B37E",
                      }}
                    >
                      {currentProgress}%
                    </span>
                  </div>
                </div>

                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={progressData}
                      margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="blueGradDesktop"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0052CC"
                            stopOpacity={0.18}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0052CC"
                            stopOpacity={0.01}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#EBF3FF"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="week"
                        stroke="#B0BAD3"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 11,
                          fill: "#6B7A99",
                        }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#B0BAD3"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 11,
                          fill: "#6B7A99",
                        }}
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
                        dot={{
                          r: 5,
                          fill: "#0052CC",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 7,
                          fill: "#0052CC",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div
                className="rounded-3xl p-6 shadow-sm mb-8"
                style={{ background: "#ffffff", border: "1.5px solid #DBEAFE" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList size={18} color="#0052CC" />
                  <h3
                    style={{ fontSize: 18, fontWeight: 600, color: "#1A2B5F" }}
                  >
                    Resumo clínico
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "#F8FBFF",
                      border: "1px solid #DBEAFE",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7A99",
                        marginBottom: 4,
                      }}
                    >
                      Responsável
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1A2B5F",
                      }}
                    >
                      {patient.responsavel_nome || "Não informado"}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "#F8FBFF",
                      border: "1px solid #DBEAFE",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7A99",
                        marginBottom: 4,
                      }}
                    >
                      Última sessão
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1A2B5F",
                      }}
                    >
                      {latestSession
                        ? formatDate(
                            latestSession.updated_at ||
                              latestSession.created_at,
                          )
                        : "Sem sessões"}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "#F8FBFF",
                      border: "1px solid #DBEAFE",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7A99",
                        marginBottom: 4,
                      }}
                    >
                      Sessões concluídas
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1A2B5F",
                      }}
                    >
                      {completedSessions} de {totalSessions}
                    </p>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 mt-4"
                  style={{ background: "#F8FBFF", border: "1px solid #DBEAFE" }}
                >
                  <p
                    style={{ fontSize: 12, color: "#6B7A99", marginBottom: 6 }}
                  >
                    Observações clínicas
                  </p>
                  <p
                    style={{ fontSize: 14, color: "#1A2B5F", lineHeight: 1.7 }}
                  >
                    {patient.observacoes?.trim() ||
                      "Sem observações clínicas registradas."}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3
                    style={{ fontSize: 20, fontWeight: 600, color: "#1A2B5F" }}
                  >
                    Exercícios cadastrados
                  </h3>

                  <span
                    style={{
                      fontSize: 12,
                      color: "#0052CC",
                      fontWeight: 600,
                      background: "#EBF3FF",
                      padding: "6px 12px",
                      borderRadius: 12,
                    }}
                  >
                    {exercicios.length} exercícios
                  </span>
                </div>

                {exercicios.length === 0 ? (
                  <div
                    className="rounded-3xl p-8 text-center"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #DBEAFE",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1A2B5F",
                      }}
                    >
                      Nenhum exercício cadastrado para este paciente
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {exercicios.map((exercicio) => (
                      <div
                        key={exercicio.id}
                        className="rounded-3xl p-5"
                        style={{
                          background: "#ffffff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 2px 8px rgba(0,82,204,0.05)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#1A2B5F",
                          }}
                        >
                          {exercicio.categoria}
                        </p>

                        <p
                          style={{
                            fontSize: 12,
                            color: "#0052CC",
                            marginTop: 4,
                          }}
                        >
                          Nível: {exercicio.nivel}
                        </p>

                        <p
                          style={{
                            fontSize: 13,
                            color: "#6B7A99",
                            marginTop: 10,
                          }}
                        >
                          <strong>Objetivo:</strong> {exercicio.objetivo}
                        </p>

                        <p
                          style={{
                            fontSize: 13,
                            color: "#6B7A99",
                            marginTop: 8,
                          }}
                        >
                          <strong>Conteúdo:</strong> {exercicio.conteudo}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3
                    style={{ fontSize: 20, fontWeight: 600, color: "#1A2B5F" }}
                  >
                    Sessões recentes
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#0052CC",
                      fontWeight: 600,
                      background: "#EBF3FF",
                      padding: "6px 12px",
                      borderRadius: 12,
                    }}
                  >
                    {recentSessions.length} registros
                  </span>
                </div>

                {recentSessions.length === 0 ? (
                  <div
                    className="rounded-3xl p-8 text-center"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #DBEAFE",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1A2B5F",
                        marginBottom: 8,
                      }}
                    >
                      Nenhum atendimento registrado
                    </p>
                    <p style={{ fontSize: 14, color: "#6B7A99" }}>
                      Assim que as sessões forem registradas, elas aparecerão
                      aqui.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {recentSessions.map((session) => {
                      const sessionDate =
                        session.updated_at || session.created_at;

                      return (
                        <div
                          key={session.id}
                          className="flex items-center gap-4 p-5 rounded-3xl"
                          style={{
                            background: "#ffffff",
                            border: "1.5px solid #DBEAFE",
                            boxShadow: "0 2px 8px rgba(0,82,204,0.05)",
                          }}
                        >
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: session.concluido
                                ? "#ECFDF5"
                                : "#FFF7E6",
                            }}
                          >
                            {session.concluido ? (
                              <CheckCircle size={22} color="#36B37E" />
                            ) : (
                              <RefreshCw size={20} color="#FFAB00" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                style={{
                                  fontSize: 16,
                                  fontWeight: 600,
                                  color: "#1A2B5F",
                                }}
                              >
                                {session.exercicio_categoria ||
                                  "Sessão terapêutica"}
                              </p>
                              <span
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  background: "#EBF3FF",
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: "#0052CC",
                                }}
                              >
                                {session.exercicio_nivel || "Nível"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mic size={11} color="#B0BAD3" />
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "#B0BAD3",
                                  fontWeight: 400,
                                }}
                              >
                                {formatDate(sessionDate)} ·{" "}
                                {formatTime(sessionDate)}
                              </span>
                            </div>

                            <p
                              style={{
                                fontSize: 12,
                                color: "#6B7A99",
                                marginTop: 8,
                                lineHeight: 1.5,
                              }}
                            >
                              {session.observacoes?.trim() ||
                                "Sem observações registradas."}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5">
                              {session.concluido ? (
                                <CheckCircle
                                  size={18}
                                  color="#36B37E"
                                  fill="#36B37E"
                                />
                              ) : (
                                <RefreshCw size={16} color="#FFAB00" />
                              )}
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: session.concluido
                                    ? "#36B37E"
                                    : "#FFAB00",
                                }}
                              >
                                {session.concluido ? "100%" : "0%"}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: session.concluido
                                  ? "#36B37E"
                                  : "#FFAB00",
                              }}
                            >
                              {session.concluido ? "Concluída" : "Pendente"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="md:hidden flex flex-col flex-1 overflow-y-auto"
          style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
        >
          <div
            className="px-6 pt-14 pb-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(150deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
            }}
          >
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 mb-5"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <ArrowLeft size={20} color="rgba(255,255,255,0.85)" />
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 400,
                }}
              >
                Voltar
              </span>
            </button>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {patientInitials}
                </span>
              </div>
              <div>
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {patientName}
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 400,
                  }}
                >
                  {patientAge} anos
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {[
                {
                  label: "Sessões",
                  value: String(totalSessions),
                  icon: Calendar,
                },
                { label: "Melhor", value: `${bestResult}%`, icon: Award },
                {
                  label: "Atual",
                  value: `${currentProgress}%`,
                  icon: TrendingUp,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-2xl p-3 flex flex-col gap-1"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <s.icon size={14} color="rgba(255,255,255,0.75)" />
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 400,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 mt-5">
            <div
              className="rounded-3xl p-5 shadow-sm"
              style={{ background: "#ffffff", border: "1.5px solid #DBEAFE" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1A2B5F",
                    }}
                  >
                    Evolução terapêutica
                  </h2>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#6B7A99",
                      fontWeight: 400,
                    }}
                  >
                    Sessões concluídas nas últimas 8 sessões
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full flex items-center gap-1"
                  style={{ background: "#ECFDF5" }}
                >
                  <TrendingUp size={12} color="#36B37E" />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#36B37E",
                    }}
                  >
                    {currentProgress}%
                  </span>
                </div>
              </div>

              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={progressData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#0052CC"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0052CC"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#EBF3FF"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="week"
                      tick={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 10,
                        fill: "#B0BAD3",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 10,
                        fill: "#B0BAD3",
                      }}
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
                      dot={{
                        r: 4,
                        fill: "#0052CC",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#0052CC",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="px-6 mt-5">
            <div
              className="rounded-3xl p-5"
              style={{ background: "#ffffff", border: "1.5px solid #DBEAFE" }}
            >
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1A2B5F",
                  marginBottom: 12,
                }}
              >
                Informações clínicas
              </h2>

              <p style={{ fontSize: 12, color: "#6B7A99", marginBottom: 6 }}>
                Responsável
              </p>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1A2B5F",
                  marginBottom: 12,
                }}
              >
                {patient.responsavel_nome || "Não informado"}
              </p>

              <p style={{ fontSize: 12, color: "#6B7A99", marginBottom: 6 }}>
                Observações
              </p>
              <p style={{ fontSize: 13, color: "#1A2B5F", lineHeight: 1.7 }}>
                {patient.observacoes?.trim() ||
                  "Sem observações clínicas registradas."}
              </p>
            </div>
          </div>

          <div className="px-6 mt-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1A2B5F",
                }}
              >
                Sessões recentes
              </h2>
              <span
                style={{
                  fontSize: 11,
                  color: "#0052CC",
                  fontWeight: 500,
                }}
              >
                {recentSessions.length} registros
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {recentSessions.length === 0 ? (
                <div
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #DBEAFE",
                  }}
                >
                  <p
                    style={{ fontSize: 14, fontWeight: 600, color: "#1A2B5F" }}
                  >
                    Nenhuma sessão registrada
                  </p>
                </div>
              ) : (
                recentSessions.map((session) => {
                  const sessionDate = session.updated_at || session.created_at;

                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #DBEAFE",
                        boxShadow: "0 2px 8px rgba(0,82,204,0.05)",
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: session.concluido ? "#ECFDF5" : "#FFF7E6",
                        }}
                      >
                        {session.concluido ? (
                          <CheckCircle
                            size={16}
                            color="#36B37E"
                            fill="#36B37E"
                          />
                        ) : (
                          <RefreshCw size={14} color="#FFAB00" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#1A2B5F",
                            }}
                          >
                            {session.exercicio_categoria ||
                              "Sessão terapêutica"}
                          </p>
                          <span
                            className="px-2 py-0.5 rounded-full"
                            style={{
                              background: "#EBF3FF",
                              fontSize: 9,
                              fontWeight: 500,
                              color: "#0052CC",
                            }}
                          >
                            {session.exercicio_nivel || "Nível"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mic size={10} color="#B0BAD3" />
                          <span
                            style={{
                              fontSize: 11,
                              color: "#B0BAD3",
                              fontWeight: 400,
                            }}
                          >
                            {formatDate(sessionDate)} ·{" "}
                            {formatTime(sessionDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: session.concluido ? "#36B37E" : "#FFAB00",
                          }}
                        >
                          {session.concluido ? "100%" : "0%"}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            color: session.concluido ? "#36B37E" : "#FFAB00",
                          }}
                        >
                          {session.concluido ? "Concluída" : "Pendente"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-col gap-3 mt-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    navigate("/exercise", {
                      state: {
                        origem: "fono",
                        pacienteId: patient.id,
                      },
                    })
                  }
                  className="py-4 rounded-2xl flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #0052CC, #0065FF)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,82,204,0.3)",
                  }}
                >
                  <Mic size={18} />
                  Iniciar
                </button>

                <button
                  onClick={() =>
                    navigate("/add-exercise", {
                      state: { pacienteId: patient.id },
                    })
                  }
                  className="py-4 rounded-2xl flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #36B37E, #57D9A3)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(54,179,126,0.28)",
                  }}
                >
                  <Plus size={18} />
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    </MobileWrapper>
  );
}

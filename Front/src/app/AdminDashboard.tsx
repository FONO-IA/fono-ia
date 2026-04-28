import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { listarPacientes } from "../services/pacientes";
import { getMe } from "../services/auth";
import { listarExercicios } from "../services/exercicios";
import type { Exercicio } from "../services/exercicios";
import {
  Search,
  Plus,
  Users,
  Settings,
  ChevronRight,
  Bell,
  Calendar,
  Clock,
  LogOut,
  Crown,
} from "lucide-react";

type DashboardStats = {
  totalPacientes: number;
  sessoesHoje: number;
};

type DashboardFono = {
  nome: string;
  crfa: string;
  iniciais: string;
};

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

type DashboardPatient = {
  id: string;
  name: string;
  age: number;
  initials: string;
  color: string;
  lastSession: string;
  progress: number;
  numberExercises: number;
  statusColor: string;
};

const colors = [
  "#4C9AFF",
  "#FF7452",
  "#57D9A3",
  "#998DD9",
  "#F99CDB",
  "#36B37E",
];

const calculateAge = (birthDate: string) => {
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

const getInitials = (name: string) => {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const formatLastSession = (date?: string) => {
  if (!date) return "Sem Exercícios";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return "Sem sessões";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isToday = (dateString?: string) => {
  if (!dateString) return false;

  const today = new Date();
  const date = new Date(dateString);

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const mapPacienteToCard = (
  patient: ApiPaciente,
  exercicios: Exercicio[],
  index: number,
): DashboardPatient => {
  const exerciciosDoPaciente = exercicios.filter(
    (e) => String(e.paciente) === String(patient.id),
  );

  const total = exerciciosDoPaciente.length;

  const concluidos = exerciciosDoPaciente.filter((e) => e.concluido).length;

  const progress = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  return {
    id: patient.id,
    name: patient.nome,
    age: calculateAge(patient.data_nascimento),
    initials: getInitials(patient.nome),
    color: colors[index % colors.length],
    lastSession: formatLastSession(patient.ultima_sessao),
    progress,
    numberExercises: total,
    statusColor: "#6B7A99",
  };
};

export function AdminDashboard() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);

  const [fono, setFono] = useState<DashboardFono>({
    nome: "Fonoaudiólogo",
    crfa: "-",
    iniciais: "FO",
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalPacientes: 0,
    sessoesHoje: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [pacientesData, fonoData, exerciciosData] = await Promise.all([
          listarPacientes(),
          getMe(),
          listarExercicios(),
        ]);

        const exerciciosHoje = exerciciosData.filter((e) =>
          isToday(e.created_at),
        ).length;

        const mappedPatients = pacientesData.map(
          (patient: ApiPaciente, index: number) =>
            mapPacienteToCard(patient, exerciciosData, index),
        );

        setStats({
          totalPacientes: pacientesData.length,
          sessoesHoje: exerciciosHoje,
        });

        setExercicios(exerciciosData);
        setPatients(mappedPatients);

        const fonoAtual = fonoData;
        if (fonoAtual) {
          setFono({
            nome: fonoAtual.nome,
            crfa: fonoAtual.crfa,
            iniciais: getInitials(fonoAtual.nome),
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao carregar dashboard.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const filtered = useMemo(() => {
    return patients.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [patients, searchQuery]);

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="flex min-h-screen"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: "#F4F7FF",
        }}
      >
        <div
          className="hidden md:flex md:flex-col md:w-72 lg:w-80 min-h-screen"
          style={{
            background:
              "linear-gradient(180deg, #003884 0%, #0052CC 50%, #0065FF 100%)",
          }}
        >
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <img
                  src="https://res.cloudinary.com/dqkpkmicx/image/upload/q_auto/f_auto/v1775585373/logo_fono_ia_ppzb2r.png"
                  alt="Logo Fono IA"
                  className="w-full h-full object-cover rounded-[16px]"
                />
              </div>
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: 1.5,
                  }}
                >
                  FONO<span style={{ opacity: 0.9 }}>-IA</span>
                </h2>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 400,
                  }}
                >
                  Portal Profissional
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  {fono.iniciais}
                </span>
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  {fono.nome}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 400,
                  }}
                >
                  {fono.crfa}
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Crown size={12} color="#FFD700" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#FFD700" }}>
                Plano Pro
              </span>
            </div>
          </div>

          <div className="flex-1" />

          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => navigate("/settings/perfil")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Settings size={20} color="rgba(255,255,255,0.6)" />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Configurações
              </span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{
                background: "rgba(255,86,48,0.15)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <LogOut size={20} color="#FF9580" />
              <span style={{ fontSize: 14, fontWeight: 500, color: "#FFB4A6" }}>
                Sair
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="hidden md:flex md:flex-col md:flex-1 min-h-0">
            <div
              className="px-8 lg:px-12 py-6 border-b border-gray-200"
              style={{ background: "#fff" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#6B7A99",
                      fontWeight: 400,
                    }}
                  >
                    Dashboard
                  </p>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#1A2B5F",
                      marginTop: 4,
                    }}
                  >
                    Olá, {fono.nome}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all hover:bg-gray-100"
                    style={{
                      background: "#F4F7FF",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Bell size={20} color="#6B7A99" />
                  </button>
                  <button
                    onClick={() => navigate("/add-patient")}
                    className="px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #0052CC, #0065FF)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={18} />
                    Novo Paciente
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Total de Pacientes",
                    value: String(stats.totalPacientes),
                    icon: Users,
                    color: "#0052CC",
                  },
                  {
                    label: "Sessões Hoje",
                    value: String(stats.sessoesHoje),
                    icon: Calendar,
                    color: "#FFAB00",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-5 flex items-center gap-4"
                    style={{
                      background: "#F4F7FF",
                      border: "1.5px solid #DBEAFE",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${stat.color}15` }}
                    >
                      <stat.icon size={24} color={stat.color} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: "#1A2B5F",
                        }}
                      >
                        {stat.value}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6B7A99",
                          fontWeight: 400,
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-8 lg:px-12 py-6">
              <div className="flex items-center justify-between mb-6">
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#1A2B5F",
                  }}
                >
                  Meus Pacientes
                </h2>
                <div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl w-96"
                  style={{
                    background: "#fff",
                    border: "1.5px solid #DBEAFE",
                  }}
                >
                  <Search size={18} color="#6B7A99" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar paciente..."
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      fontSize: 14,
                      fontWeight: 400,
                      color: "#1A2B5F",
                      background: "transparent",
                    }}
                  />
                </div>
              </div>

              {loading && (
                <p style={{ color: "#6B7A99" }}>Carregando pacientes...</p>
              )}

              {!loading && error && (
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#B91C1C",
                  }}
                >
                  {error}
                </div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div
                  className="rounded-3xl p-8 text-center"
                  style={{
                    background: "#fff",
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
                    Nenhum paciente encontrado
                  </p>
                  <p style={{ fontSize: 14, color: "#6B7A99" }}>
                    Cadastre um paciente para ele aparecer aqui.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">
                {filtered.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => navigate(`/patient/${patient.id}`)}
                    className="text-left rounded-3xl p-5 flex items-center gap-4 transition-all hover:shadow-lg"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 2px 12px rgba(0,82,204,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${patient.color}22` }}
                    >
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: patient.color,
                        }}
                      >
                        {patient.initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#1A2B5F",
                          }}
                        >
                          {patient.name}
                        </p>
                        <ChevronRight size={18} color="#B0BAD3" />
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="px-2.5 py-1 rounded-full"
                          style={{
                            background: "#EBF3FF",
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#0052CC",
                          }}
                        >
                          {patient.age} anos
                        </span>
                        <Clock size={11} color={patient.statusColor} />
                        <span
                          style={{
                            fontSize: 12,
                            color: "#6B7A99",
                            fontWeight: 400,
                          }}
                        >
                          Último exercício: {patient.lastSession}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 rounded-full overflow-hidden"
                          style={{ height: 6, background: "#EBF3FF" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${patient.progress}%`,
                              background:
                                "linear-gradient(90deg, #0052CC, #0065FF)",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#0052CC",
                          }}
                        >
                          {patient.progress}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span
                          style={{
                            fontSize: 11,
                            color: patient.statusColor,
                            fontWeight: 500,
                          }}
                        >
                          {`Exercícios: ${patient.numberExercises}`}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className="md:hidden flex flex-col flex-1 min-h-screen"
            style={{
              fontFamily: "'Poppins', sans-serif",
              background: "#F4F7FF",
            }}
          >
            <div
              className="px-6 pt-14 pb-6 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(150deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
              }}
            >
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 400,
                    }}
                  >
                    Dashboard
                  </p>
                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.3,
                    }}
                  >
                    Olá, {fono.nome} 👋
                  </h1>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 400,
                    }}
                  >
                    {stats.totalPacientes} pacientes cadastrados
                  </p>
                </div>
                <button
                  className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Bell size={20} color="white" />
                </button>
              </div>

              <div className="flex gap-3 relative z-10 mb-1">
                {[
                  {
                    label: "Pacientes",
                    value: String(stats.totalPacientes),
                    icon: Users,
                  },
                  {
                    label: "Sessões hoje",
                    value: String(stats.sessoesHoje),
                    icon: Calendar,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex-1 rounded-2xl p-3 flex flex-col gap-1"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <stat.icon size={16} color="rgba(255,255,255,0.8)" />
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 400,
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 -mt-4 relative z-20">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-md"
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #DBEAFE",
                }}
              >
                <Search size={18} color="#6B7A99" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar paciente..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#1A2B5F",
                    background: "transparent",
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-32">
              <div className="flex items-center justify-between mb-4">
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1A2B5F",
                  }}
                >
                  Meus Pacientes
                </h2>
                <span
                  style={{
                    fontSize: 12,
                    color: "#6B7A99",
                    fontWeight: 400,
                  }}
                >
                  {filtered.length} pacientes
                </span>
              </div>

              {loading && (
                <p style={{ color: "#6B7A99" }}>Carregando pacientes...</p>
              )}

              {!loading && error && (
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#B91C1C",
                  }}
                >
                  {error}
                </div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <div
                  className="rounded-3xl p-8 text-center"
                  style={{
                    background: "#fff",
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
                    Nenhum paciente encontrado
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {filtered.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => navigate(`/patient/${patient.id}`)}
                    className="w-full text-left rounded-3xl p-4 flex items-center gap-4"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 2px 12px rgba(0,82,204,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${patient.color}22` }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: patient.color,
                        }}
                      >
                        {patient.initials}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1A2B5F",
                          }}
                        >
                          {patient.name}
                        </p>
                        <ChevronRight size={16} color="#B0BAD3" />
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            background: "#EBF3FF",
                            fontSize: 10,
                            fontWeight: 500,
                            color: "#0052CC",
                          }}
                        >
                          {patient.age} anos
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#6B7A99",
                            fontWeight: 400,
                          }}
                        >
                          · Último exercício: {patient.lastSession}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 rounded-full overflow-hidden"
                          style={{ height: 5, background: "#EBF3FF" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${patient.progress}%`,
                              background:
                                "linear-gradient(90deg, #0052CC, #0065FF)",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#0052CC",
                          }}
                        >
                          {patient.progress}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock size={10} color={patient.statusColor} />
                        <span
                          style={{
                            fontSize: 10,
                            color: patient.statusColor,
                            fontWeight: 500,
                          }}
                        >
                          {`Exercícios: ${patient.numberExercises}`}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/add-patient")}
              className="fixed md:hidden flex items-center justify-center rounded-full shadow-lg"
              style={{
                width: 60,
                height: 60,
                background: "linear-gradient(135deg, #0052CC, #0065FF)",
                border: "3px solid #fff",
                cursor: "pointer",
                bottom: 88,
                right: 24,
                boxShadow: "0 6px 20px rgba(0,82,204,0.45)",
                zIndex: 30,
              }}
            >
              <Plus size={28} color="white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}

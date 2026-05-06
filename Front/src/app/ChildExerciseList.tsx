import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Loader2,
  LogOut,
  Play,
  RefreshCw,
  UserRound,
  UsersRound,
} from "lucide-react";
import { motion } from "motion/react";
import { MobileWrapper } from "./MobileWrapper";
import type { Exercicio } from "../services/exercicios";
import type { Paciente } from "../services/pacientes";
import { listarExerciciosDoPaciente } from "../services/pacientes";
import type { Responsavel } from "../services/responsaveis";
import {
  buscarResponsavelLogado,
  listarPacientesDoResponsavelLogado,
} from "../services/responsaveis";

type PatientExercises = {
  paciente: Paciente;
  exercicios: Exercicio[];
  error?: string;
};

type ExerciseStatus = {
  label: string;
  action: string;
  bg: string;
  color: string;
  icon: "check" | "play";
};

function getExerciseTitle(exercicio: Exercicio) {
  return exercicio.titulo?.trim() || exercicio.categoria || "Exercicio";
}

function getExerciseDescription(exercicio: Exercicio) {
  return (
    exercicio.descricao?.trim() ||
    exercicio.objetivo?.trim() ||
    exercicio.instrucao?.trim() ||
    exercicio.conteudo?.trim() ||
    "Sem descricao cadastrada."
  );
}

function getExerciseStatus(exercicio: Exercicio): ExerciseStatus {
  const status = exercicio.status?.toLowerCase();

  if (
    exercicio.concluido ||
    status === "concluido" ||
    status === "concluida" ||
    status === "finalizado" ||
    status === "done"
  ) {
    return {
      label: "Concluido",
      action: "Refazer",
      bg: "#ECFDF5",
      color: "#1F8A5B",
      icon: "check",
    };
  }

  if (status === "em_andamento" || status === "andamento") {
    return {
      label: "Em andamento",
      action: "Continuar",
      bg: "#FFF7E6",
      color: "#B76E00",
      icon: "play",
    };
  }

  return {
    label: "Pendente",
    action: "Iniciar",
    bg: "#EBF3FF",
    color: "#0052CC",
    icon: "play",
  };
}

function formatDeadline(value?: string | null) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DetailPill({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "gray";
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1"
      style={{
        background: tone === "blue" ? "#EBF3FF" : "#F1F5F9",
        color: tone === "blue" ? "#0052CC" : "#64748B",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

export function ChildExerciseList() {
  const navigate = useNavigate();
  const [responsavel, setResponsavel] = useState<Responsavel | null>(null);
  const [groups, setGroups] = useState<PatientExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    return groups.reduce(
      (acc, group) => {
        acc.exercises += group.exercicios.length;
        acc.completed += group.exercicios.filter((exercise) => {
          const status = getExerciseStatus(exercise);
          return status.label === "Concluido";
        }).length;
        return acc;
      },
      { exercises: 0, completed: 0 },
    );
  }, [groups]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [responsavelData, pacientes] = await Promise.all([
        buscarResponsavelLogado(),
        listarPacientesDoResponsavelLogado(),
      ]);

      const patientGroups = await Promise.all(
        pacientes.map(async (paciente) => {
          try {
            const exercicios = await listarExerciciosDoPaciente(
              String(paciente.id),
            );
            return { paciente, exercicios };
          } catch (err) {
            return {
              paciente,
              exercicios: [],
              error:
                err instanceof Error
                  ? err.message
                  : "Nao foi possivel carregar os exercicios.",
            };
          }
        }),
      );

      setResponsavel(responsavelData);
      setGroups(patientGroups);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nao foi possivel carregar os dados do responsavel.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined" || token === "null" || !token.trim()) {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("userRole");
      navigate("/", { replace: true });
      return;
    }

    void loadData();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("userRole");
    navigate("/", { replace: true });
  }

  function handleOpenExercise(pacienteId: string, exerciseId: string) {
    navigate(`/child/exercise/${exerciseId}`, {
      state: { pacienteId },
    });
  }

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="min-h-screen"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: "#F4F7FF",
        }}
      >
        <header
          className="relative overflow-hidden px-5 py-8 md:px-12 md:py-10"
          style={{
            background:
              "linear-gradient(150deg, #003884 0%, #0052CC 55%, #0065FF 100%)",
          }}
        >
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-10 md:h-96 md:w-96"
            style={{ background: "#FFFFFF" }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full opacity-10 md:h-64 md:w-64"
            style={{ background: "#FFFFFF" }}
          />

          <div className="relative z-10 mx-auto flex max-w-7xl items-start justify-between gap-5">
            <div>
              <p
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 20,
                  fontWeight: 500,
                  marginBottom: 8,
                }}
              >
                Ola, {responsavel?.nome?.split(" ")[0] || "responsavel"}!
              </p>
              <h1
                style={{
                  color: "#FFFFFF",
                  fontSize: "clamp(28px, 5vw, 48px)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}
              >
                Escolha um paciente para praticar.
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.82)",
                  fontSize: 15,
                  fontWeight: 400,
                }}
              >
                Os exercicios criados pelo fonoaudiólogo para cada paciente aparecerão aqui. Toque no paciente para ver os exercicios disponiveis e comecar a praticar.
              </p>

              {!loading && !error && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-2"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <UsersRound size={18} color="#FFFFFF" />
                    <span
                      style={{
                        color: "#FFFFFF",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {groups.length} paciente{groups.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-2"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <ClipboardList size={18} color="#FFFFFF" />
                    <span
                      style={{
                        color: "#FFFFFF",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {totals.completed}/{totals.exercises} concluidos
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              aria-label="Sair"
              onClick={handleLogout}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all hover:bg-white/20"
              style={{
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
              }}
            >
              <LogOut size={22} color="rgba(255,255,255,0.9)" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-6 md:px-12 md:py-10">
          {loading && (
            <div
              className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl"
              style={{
                background: "#FFFFFF",
                border: "1px solid #DBEAFE",
                boxShadow: "0 10px 30px rgba(0,82,204,0.08)",
              }}
            >
              <Loader2
                className="mb-4 animate-spin"
                size={42}
                color="#0052CC"
              />
              <p
                style={{
                  color: "#1A2B5F",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                Carregando exercicios
              </p>
              <p style={{ color: "#6B7A99", fontSize: 14, marginTop: 6 }}>
                Buscando pacientes vinculados ao responsavel logado.
              </p>
            </div>
          )}

          {!loading && error && (
            <div
              className="rounded-3xl p-6 md:p-8"
              style={{
                background: "#FFF0EC",
                border: "2px solid #FECDC3",
              }}
            >
              <div className="flex items-start gap-4">
                <AlertCircle size={28} color="#FF5630" />
                <div className="min-w-0 flex-1">
                  <h2
                    style={{
                      color: "#7A271A",
                      fontSize: 22,
                      fontWeight: 800,
                      marginBottom: 6,
                    }}
                  >
                    Nao conseguimos carregar sua area de pratica.
                  </h2>
                  <p style={{ color: "#9A3412", fontSize: 14 }}>
                    {error}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => void loadData()}
                      className="flex items-center gap-2 rounded-2xl px-5 py-3"
                      style={{
                        background: "#FF5630",
                        border: "none",
                        color: "#FFFFFF",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      <RefreshCw size={17} />
                      Tentar novamente
                    </button>
                    <button
                      onClick={handleLogout}
                      className="rounded-2xl px-5 py-3"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #FECDC3",
                        color: "#7A271A",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div
              className="rounded-3xl p-8 text-center"
              style={{
                background: "#FFFFFF",
                border: "1px solid #DBEAFE",
                boxShadow: "0 10px 30px rgba(0,82,204,0.08)",
              }}
            >
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl"
                style={{ background: "#EBF3FF" }}
              >
                <UsersRound size={30} color="#0052CC" />
              </div>
              <h2
                style={{
                  color: "#1A2B5F",
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                Nenhum paciente vinculado ainda.
              </h2>
              <p
                className="mx-auto max-w-xl"
                style={{ color: "#6B7A99", fontSize: 15, lineHeight: 1.6 }}
              >
                Quando o terapeuta vincular pacientes a este responsavel, os
                exercicios aparecerao aqui automaticamente.
              </p>
            </div>
          )}

          {!loading && !error && groups.length > 0 && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {groups.map((group, index) => (
                <motion.section
                  key={group.paciente.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.25 }}
                  className="rounded-3xl p-5 md:p-6"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #DBEAFE",
                    boxShadow: "0 10px 30px rgba(0,82,204,0.08)",
                  }}
                >
                  <div className="mb-5 flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: "#EBF3FF" }}
                    >
                      <UserRound size={26} color="#0052CC" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2
                        style={{
                          color: "#1A2B5F",
                          fontSize: 22,
                          fontWeight: 800,
                          lineHeight: 1.2,
                        }}
                      >
                        {group.paciente.nome}
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <DetailPill>
                          {group.exercicios.length} exercicio
                          {group.exercicios.length === 1 ? "" : "s"}
                        </DetailPill>
                        {group.paciente.data_nascimento && (
                          <DetailPill tone="gray">
                            Nasc. {group.paciente.data_nascimento}
                          </DetailPill>
                        )}
                      </div>
                      {group.paciente.observacoes && (
                        <p
                          className="mt-3"
                          style={{
                            color: "#6B7A99",
                            fontSize: 13,
                            lineHeight: 1.5,
                          }}
                        >
                          {group.paciente.observacoes}
                        </p>
                      )}
                    </div>
                  </div>

                  {group.error && (
                    <div
                      className="rounded-2xl p-4"
                      style={{
                        background: "#FFF0EC",
                        border: "1px solid #FECDC3",
                        color: "#9A3412",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {group.error}
                    </div>
                  )}

                  {!group.error && group.exercicios.length === 0 && (
                    <div
                      className="rounded-2xl p-5 text-center"
                      style={{
                        background: "#F8FAFC",
                        border: "1px dashed #CBD5E1",
                      }}
                    >
                      <ClipboardList
                        className="mx-auto mb-3"
                        size={28}
                        color="#94A3B8"
                      />
                      <p
                        style={{
                          color: "#475569",
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        Este paciente ainda nao possui exercicios cadastrados.
                      </p>
                    </div>
                  )}

                  {!group.error && group.exercicios.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {group.exercicios.map((exercicio) => {
                        const status = getExerciseStatus(exercicio);
                        const prazo = formatDeadline(exercicio.prazo);
                        const dificuldade =
                          exercicio.dificuldade?.toString() ||
                          exercicio.nivel_display ||
                          exercicio.nivel;

                        return (
                          <motion.button
                            key={exercicio.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              handleOpenExercise(
                                String(group.paciente.id),
                                String(exercicio.id),
                              )
                            }
                            className="w-full rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5"
                            style={{
                              background: "#FFFFFF",
                              border: "1.5px solid #DBEAFE",
                              boxShadow: "0 4px 16px rgba(0,82,204,0.06)",
                              cursor: "pointer",
                            }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                                style={{ background: status.bg }}
                              >
                                {status.icon === "check" ? (
                                  <CheckCircle2
                                    size={24}
                                    color={status.color}
                                  />
                                ) : (
                                  <Play
                                    size={22}
                                    color={status.color}
                                    fill={status.color}
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <span
                                    className="rounded-full px-3 py-1"
                                    style={{
                                      background: status.bg,
                                      color: status.color,
                                      fontSize: 12,
                                      fontWeight: 800,
                                    }}
                                  >
                                    {status.label}
                                  </span>
                                  {exercicio.categoria && (
                                    <DetailPill tone="gray">
                                      {exercicio.categoria}
                                    </DetailPill>
                                  )}
                                  {dificuldade && (
                                    <DetailPill tone="gray">
                                      Nivel {dificuldade}
                                    </DetailPill>
                                  )}
                                </div>

                                <h3
                                  style={{
                                    color: "#1A2B5F",
                                    fontSize: 17,
                                    fontWeight: 800,
                                    lineHeight: 1.25,
                                    marginBottom: 6,
                                  }}
                                >
                                  {getExerciseTitle(exercicio)}
                                </h3>
                                <p
                                  style={{
                                    color: "#6B7A99",
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    marginBottom: 10,
                                  }}
                                >
                                  {getExerciseDescription(exercicio)}
                                </p>

                                {prazo && (
                                  <div className="flex items-center gap-2">
                                    <CalendarDays
                                      size={15}
                                      color="#64748B"
                                    />
                                    <span
                                      style={{
                                        color: "#64748B",
                                        fontSize: 12,
                                        fontWeight: 600,
                                      }}
                                    >
                                      Prazo: {prazo}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div
                                className="hidden shrink-0 items-center gap-1 rounded-2xl px-4 py-3 md:flex"
                                style={{
                                  background: "#0052CC",
                                  color: "#FFFFFF",
                                  fontSize: 13,
                                  fontWeight: 800,
                                }}
                              >
                                {status.action}
                                <ChevronRight size={16} />
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </motion.section>
              ))}
            </div>
          )}
        </main>
      </div>
    </MobileWrapper>
  );
}

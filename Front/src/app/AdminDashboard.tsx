import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import {
  Search,
  Plus,
  Users,
  BarChart2,
  Settings,
  ChevronRight,
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  LogOut,
  Crown,
} from "lucide-react";

const patients = [
  {
    id: "1",
    name: "Lucas Mendes",
    age: 6,
    initials: "LM",
    color: "#4C9AFF",
    lastSession: "24 Fev 2026",
    progress: 82,
    status: "Ótimo progresso",
    statusColor: "#36B37E",
    nextSession: "Hoje, 14:30",
  },
  {
    id: "2",
    name: "Ana Beatriz Costa",
    age: 7,
    initials: "AB",
    color: "#FF7452",
    lastSession: "23 Fev 2026",
    progress: 65,
    status: "Em progresso",
    statusColor: "#FFAB00",
    nextSession: "Amanhã, 10:00",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    age: 5,
    initials: "PO",
    color: "#57D9A3",
    lastSession: "21 Fev 2026",
    progress: 45,
    status: "Precisa atenção",
    statusColor: "#FF5630",
    nextSession: "27 Fev, 09:00",
  },
  {
    id: "4",
    name: "Sofia Ribeiro",
    age: 8,
    initials: "SR",
    color: "#998DD9",
    lastSession: "20 Fev 2026",
    progress: 91,
    status: "Excelente",
    statusColor: "#36B37E",
    nextSession: "28 Fev, 15:00",
  },
  {
    id: "5",
    name: "Gabriel Santos",
    age: 6,
    initials: "GS",
    color: "#F99CDB",
    lastSession: "18 Fev 2026",
    progress: 58,
    status: "Em progresso",
    statusColor: "#FFAB00",
    nextSession: "01 Mar, 11:00",
  },
];

const tabs = [
  { id: "patients", label: "Pacientes", icon: Users },
  { id: "stats", label: "Estatísticas", icon: BarChart2 },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("patients");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="flex min-h-screen"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: "#F4F7FF",
        }}
      >
        {/* Desktop Sidebar */}
        <div
          className="hidden md:flex md:flex-col md:w-72 lg:w-80 min-h-screen"
          style={{
            background:
              "linear-gradient(180deg, #003884 0%, #0052CC 50%, #0065FF 100%)",
          }}
        >
          {/* Logo */}
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="white"
                  />
                </svg>
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

          {/* Profile card */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  PA
                </span>
              </div>
              <div className="flex-1">
                <p
                  style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}
                >
                  Dr. Paulo Andrade
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 400,
                  }}
                >
                  CRFa 6-7832
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Crown size={12} color="#FFD700" />
              <span
                style={{ fontSize: 11, fontWeight: 600, color: "#FFD700" }}
              >
                Plano Pro
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    size={20}
                    color={isActive ? "#fff" : "rgba(255,255,255,0.6)"}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
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
              <span
                style={{ fontSize: 14, fontWeight: 500, color: "#FFB4A6" }}
              >
                Sair
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop Content */}
          <div className="hidden md:flex md:flex-col md:flex-1 min-h-0">
            {/* Desktop Header */}
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
                    Quinta-feira, 26 Fev 2026
                  </p>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#1A2B5F",
                      marginTop: 4,
                    }}
                  >
                    Olá, Dr. Paulo 👋
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
                    <div
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ background: "#FF5630" }}
                    />
                  </button>
                  <button
                    onClick={() => navigate("/add-patient")}
                    className="px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(135deg, #0052CC, #0065FF)",
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Total de Pacientes",
                    value: "24",
                    icon: Users,
                    color: "#0052CC",
                  },
                  {
                    label: "Sessões Hoje",
                    value: "3",
                    icon: Calendar,
                    color: "#FFAB00",
                  },
                  {
                    label: "Taxa Média de Progresso",
                    value: "68%",
                    icon: TrendingUp,
                    color: "#36B37E",
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
                      style={{ background: stat.color + "15" }}
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

            {/* Desktop Search & Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-8 lg:px-12 py-6">
              {activeTab === "patients" && (
                <>
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
                          style={{ background: patient.color + "22" }}
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
                            <span
                              style={{
                                fontSize: 12,
                                color: "#6B7A99",
                                fontWeight: 400,
                              }}
                            >
                              · Última: {patient.lastSession}
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
                            <Clock size={11} color={patient.statusColor} />
                            <span
                              style={{
                                fontSize: 11,
                                color: patient.statusColor,
                                fontWeight: 500,
                              }}
                            >
                              {patient.status}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                color: "#B0BAD3",
                                fontWeight: 400,
                              }}
                            >
                              · Próx: {patient.nextSession}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "stats" && (
                <div className="flex flex-col items-center justify-center pt-20 gap-6 pb-10">
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{ background: "#EBF3FF" }}
                  >
                    <BarChart2 size={48} color="#0052CC" strokeWidth={1.5} />
                  </div>
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      color: "#1A2B5F",
                    }}
                  >
                    Estatísticas
                  </h2>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#6B7A99",
                      fontWeight: 400,
                      textAlign: "center",
                      maxWidth: 400,
                    }}
                  >
                    Acompanhe o desempenho geral de todos os seus pacientes em
                    um dashboard completo
                  </p>
                  <button
                    onClick={() => navigate("/patient/1")}
                    className="px-8 py-3.5 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #0052CC, #0065FF)",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Ver Progresso de Lucas
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Version */}
          <div
            className="md:hidden flex flex-col flex-1 min-h-screen"
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
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-15"
                style={{ background: "#fff" }}
              />
              <div
                className="absolute top-12 right-16 w-16 h-16 rounded-full opacity-10"
                style={{ background: "#fff" }}
              />

              <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 400,
                    }}
                  >
                    Quinta-feira, 26 Fev
                  </p>
                  <h1
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.3,
                    }}
                  >
                    Olá, Dr. Paulo 👋
                  </h1>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 400,
                    }}
                  >
                    3 sessões agendadas hoje
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
                  <div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ background: "#FF5630" }}
                  />
                </button>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 relative z-10 mb-1">
                {[
                  { label: "Pacientes", value: "24", icon: Users },
                  { label: "Sessões hoje", value: "3", icon: Calendar },
                  { label: "Média", value: "68%", icon: TrendingUp },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex-1 rounded-2xl p-3 flex flex-col gap-1"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <stat.icon size={16} color="rgba(255,255,255,0.8)" />
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
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

            {/* Search */}
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
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#1A2B5F",
                    background: "transparent",
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-32">
              {activeTab === "patients" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1A2B5F",
                      }}
                    >
                      Meus Pacientes
                    </h2>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        color: "#6B7A99",
                        fontWeight: 400,
                      }}
                    >
                      {filtered.length} pacientes
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {filtered.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => navigate(`/patient/${patient.id}`)}
                        className="w-full text-left rounded-3xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-98"
                        style={{
                          background: "#ffffff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 2px 12px rgba(0,82,204,0.06)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: patient.color + "22" }}
                        >
                          <span
                            style={{
                              fontFamily: "'Poppins', sans-serif",
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
                                fontFamily: "'Poppins', sans-serif",
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
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: 10,
                                fontWeight: 500,
                                color: "#0052CC",
                              }}
                            >
                              {patient.age} anos
                            </span>
                            <span
                              style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: 11,
                                color: "#6B7A99",
                                fontWeight: 400,
                              }}
                            >
                              · Última sessão: {patient.lastSession}
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
                                fontFamily: "'Poppins', sans-serif",
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
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: 10,
                                color: patient.statusColor,
                                fontWeight: 500,
                              }}
                            >
                              {patient.status}
                            </span>
                            <span
                              style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: 10,
                                color: "#B0BAD3",
                                fontWeight: 400,
                              }}
                            >
                              · Próx: {patient.nextSession}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "stats" && (
                <div className="flex flex-col items-center justify-center pt-16 gap-4">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: "#EBF3FF" }}
                  >
                    <BarChart2 size={40} color="#0052CC" strokeWidth={1.5} />
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#1A2B5F",
                    }}
                  >
                    Estatísticas
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      color: "#6B7A99",
                      fontWeight: 400,
                      textAlign: "center",
                    }}
                  >
                    Acompanhe o desempenho geral de todos os seus pacientes
                  </p>
                  <button
                    onClick={() => navigate("/patient/1")}
                    className="px-6 py-3 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #0052CC, #0065FF)",
                      color: "#fff",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Ver Progresso de Lucas
                  </button>
                </div>
              )}
            </div>

            {/* FAB */}
            <button
              onClick={() => navigate("/add-patient")}
              className="fixed md:hidden flex items-center justify-center rounded-full shadow-lg transition-all duration-200 active:scale-90"
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

            {/* Bottom Navigation */}
            <div
              className="fixed md:hidden bottom-0 left-0 right-0 flex items-center px-6 pb-6 pt-3"
              style={{
                background: "#ffffff",
                borderTop: "1.5px solid #DBEAFE",
                boxShadow: "0 -4px 20px rgba(0,82,204,0.08)",
                zIndex: 20,
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-1 transition-all duration-200"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-xl transition-all duration-200"
                      style={{
                        width: 42,
                        height: 32,
                        background: isActive ? "#EBF3FF" : "transparent",
                      }}
                    >
                      <Icon
                        size={20}
                        color={isActive ? "#0052CC" : "#B0BAD3"}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 10,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#0052CC" : "#B0BAD3",
                      }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}
import React, { useState } from "react";
import {
  Star,
  Users,
  Mic,
  BarChart2,
  Zap,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Crown,
  Infinity,
  FileText,
} from "lucide-react";
import { SettingsLayout, SettingsSection } from "./SettingsLayout";
import { motion, AnimatePresence } from "motion/react";

const BLUE = "#0052CC";

const plans = [
  {
    id: "essencial",
    name: "Essencial",
    price: "R$ 0",
    period: "Gratuito",
    color: "#6B7A99",
    bg: "#F4F7FF",
    border: "#DBEAFE",
    features: [
      "Até 5 pacientes",
      "20 gravações/mês",
      "Relatórios básicos",
      "Suporte por e-mail",
    ],
    icon: <Star size={20} color="#6B7A99" />,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 89",
    period: "/mês",
    color: BLUE,
    bg: "linear-gradient(135deg, #EBF3FF, #DBEAFE)",
    border: "#93C5FD",
    features: [
      "Até 30 pacientes",
      "Gravações ilimitadas",
      "Relatórios avançados",
      "IA de análise de fala",
      "Suporte prioritário",
      "App para crianças",
    ],
    icon: <Crown size={20} color={BLUE} />,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    color: "#003884",
    bg: "linear-gradient(135deg, #003884, #0052CC)",
    border: "#003884",
    features: [
      "Pacientes ilimitados",
      "API de integração",
      "Painel clínico multi-usuário",
      "SLA garantido",
      "Treinamento personalizado",
      "Gerente de conta dedicado",
    ],
    icon: <Infinity size={20} color="white" />,
    dark: true,
  },
];

const invoices = [
  { id: "INV-2026-02", date: "01 Fev 2026", value: "R$ 89,00", status: "Pago" },
  { id: "INV-2026-01", date: "01 Jan 2026", value: "R$ 89,00", status: "Pago" },
  { id: "INV-2025-12", date: "01 Dez 2025", value: "R$ 89,00", status: "Pago" },
];

export function SettingsPlano() {
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) return;
    setSelectedPlan(planId);
    setShowUpgradeConfirm(true);
  };

  const confirmUpgrade = () => {
    if (selectedPlan) setCurrentPlan(selectedPlan);
    setShowUpgradeConfirm(false);
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 3000);
  };

  const usage = {
    patients: 18,
    maxPatients: 30,
    recordings: 312,
    sessions: 47,
  };

  return (
    <SettingsLayout
      title="Plano & Assinatura"
      subtitle="Gerencie sua conta FONO-IA"
    >
      {/* Upgrade success */}
      <AnimatePresence>
        {upgraded && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
          >
            <Check size={16} color="#36B37E" />
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: "#065F46",
              }}
            >
              Plano atualizado com sucesso!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current plan card */}
      <div
        className="rounded-3xl p-5 mb-5"
        style={{
          background: "linear-gradient(135deg, #003884, #0065FF)",
          boxShadow: "0 8px 24px rgba(0,82,204,0.3)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown size={18} color="#FFD700" />
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              Plano Atual
            </span>
          </div>
          <span
            className="px-3 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.2)",
              fontFamily: "'Poppins', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: "#FFD700",
            }}
          >
            PRO
          </span>
        </div>

        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          R$ 89
          <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8 }}>
            /mês
          </span>
        </p>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,0.65)",
            fontWeight: 400,
            marginTop: 2,
          }}
        >
          Próxima cobrança: 01 Mar 2026
        </p>

        {/* Usage bars */}
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <div className="flex justify-between mb-1.5">
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 400,
                }}
              >
                Pacientes ({usage.patients}/{usage.maxPatients})
              </span>
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 11,
                  color: "#FFD700",
                  fontWeight: 600,
                }}
              >
                {Math.round((usage.patients / usage.maxPatients) * 100)}%
              </span>
            </div>
            <div
              className="rounded-full overflow-hidden"
              style={{ height: 6, background: "rgba(255,255,255,0.2)" }}
            >
              <div
                style={{
                  width: `${(usage.patients / usage.maxPatients) * 100}%`,
                  height: "100%",
                  background: "#FFD700",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div
              className="flex-1 rounded-2xl p-3 flex flex-col gap-0.5"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <Mic size={14} color="rgba(255,255,255,0.7)" />
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {usage.recordings}
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 400,
                }}
              >
                Gravações
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl p-3 flex flex-col gap-0.5"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <BarChart2 size={14} color="rgba(255,255,255,0.7)" />
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {usage.sessions}
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 400,
                }}
              >
                Sessões
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl p-3 flex flex-col gap-0.5"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <Zap size={14} color="rgba(255,255,255,0.7)" />
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                ∞
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 400,
                }}
              >
                IA ativa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <p
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          color: "#6B7A99",
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 10,
          paddingLeft: 4,
        }}
      >
        Comparar Planos
      </p>
      <div className="flex flex-col gap-3 mb-5">
        {plans.map((plan) => {
          const isActive = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className="rounded-3xl p-4 relative overflow-hidden"
              style={{
                background: plan.dark
                  ? plan.bg
                  : isActive
                    ? plan.bg
                    : "#ffffff",
                border: `2px solid ${isActive ? plan.border : "#DBEAFE"}`,
                boxShadow: isActive ? "0 4px 16px rgba(0,82,204,0.15)" : "none",
              }}
            >
              {plan.popular && (
                <div
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-full"
                  style={{ background: "#FFD700" }}
                >
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#7C3D00",
                    }}
                  >
                    MAIS POPULAR
                  </span>
                </div>
              )}
              {isActive && !plan.dark && (
                <div
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-full"
                  style={{ background: BLUE }}
                >
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    ATIVO
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: plan.dark
                      ? "rgba(255,255,255,0.15)"
                      : isActive
                        ? "#EBF3FF"
                        : "#F4F7FF",
                  }}
                >
                  {plan.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: plan.dark ? "#fff" : "#1A2B5F",
                    }}
                  >
                    {plan.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: plan.dark ? "rgba(255,255,255,0.85)" : plan.color,
                    }}
                  >
                    {plan.price}
                    <span style={{ fontSize: 11, fontWeight: 400 }}>
                      {plan.period}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check
                      size={13}
                      color={plan.dark ? "rgba(255,255,255,0.8)" : "#36B37E"}
                      strokeWidth={2.5}
                    />
                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 12,
                        fontWeight: 400,
                        color: plan.dark ? "rgba(255,255,255,0.8)" : "#6B7A99",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                className="w-full py-3 rounded-2xl transition-all active:scale-95"
                style={{
                  background: isActive
                    ? plan.dark
                      ? "rgba(255,255,255,0.2)"
                      : "#EBF3FF"
                    : plan.dark
                      ? "rgba(255,255,255,0.25)"
                      : BLUE,
                  color: isActive
                    ? plan.dark
                      ? "rgba(255,255,255,0.8)"
                      : BLUE
                    : plan.dark
                      ? "#fff"
                      : "#fff",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  cursor: isActive ? "default" : "pointer",
                }}
              >
                {isActive
                  ? "Plano atual"
                  : plan.id === "enterprise"
                    ? "Falar com vendas"
                    : "Fazer upgrade"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment info */}
      <SettingsSection title="Pagamento">
        <button
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
          style={{
            background: "none",
            border: "none",
            borderBottom: "1px solid #EBF3FF",
            cursor: "pointer",
          }}
        >
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: "#EBF3FF" }}
          >
            <CreditCard size={16} color={BLUE} />
          </div>
          <div className="flex-1">
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: "#1A2B5F",
              }}
            >
              Cartão terminado em 4782
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 11,
                color: "#6B7A99",
                fontWeight: 400,
              }}
            >
              Visa · Expira 09/2028
            </p>
          </div>
          <ChevronRight size={16} color="#B0BAD3" />
        </button>
        <button
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: "#F4F7FF" }}
          >
            <FileText size={16} color="#6B7A99" />
          </div>
          <div className="flex-1">
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: "#1A2B5F",
              }}
            >
              Histórico de faturas
            </p>
            <p
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 11,
                color: "#6B7A99",
                fontWeight: 400,
              }}
            >
              3 faturas disponíveis
            </p>
          </div>
          <ChevronRight size={16} color="#B0BAD3" />
        </button>
      </SettingsSection>

      {/* Invoices */}
      <SettingsSection title="Faturas Recentes">
        {invoices.map((inv, idx) => (
          <button
            key={inv.id}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
            style={{
              background: "none",
              border: "none",
              borderBottom:
                idx < invoices.length - 1 ? "1px solid #EBF3FF" : "none",
              cursor: "pointer",
            }}
          >
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: "#ECFDF5" }}
            >
              <Download size={15} color="#36B37E" />
            </div>
            <div className="flex-1">
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1A2B5F",
                }}
              >
                {inv.id}
              </p>
              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 11,
                  color: "#6B7A99",
                  fontWeight: 400,
                }}
              >
                {inv.date}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1A2B5F",
                }}
              >
                {inv.value}
              </span>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  background: "#ECFDF5",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 9,
                  fontWeight: 600,
                  color: "#36B37E",
                }}
              >
                {inv.status}
              </span>
            </div>
          </button>
        ))}
      </SettingsSection>

      {/* Upgrade confirm modal */}
      <AnimatePresence>
        {showUpgradeConfirm && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-end justify-center z-50"
            style={{
              background: "rgba(0,0,0,0.4)",
              maxWidth: 430,
              margin: "0 auto",
            }}
            onClick={() => setShowUpgradeConfirm(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              className="w-full rounded-t-3xl p-6"
              style={{ background: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div
                  className="w-14 h-14 rounded-3xl flex items-center justify-center"
                  style={{ background: "#EBF3FF" }}
                >
                  <Crown size={26} color={BLUE} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#1A2B5F",
                      marginBottom: 6,
                    }}
                  >
                    Confirmar mudança de plano?
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 13,
                      color: "#6B7A99",
                      fontWeight: 400,
                      lineHeight: 1.6,
                    }}
                  >
                    Você será migrado para o plano{" "}
                    <strong>
                      {plans.find((p) => p.id === selectedPlan)?.name}
                    </strong>
                    . A cobrança será ajustada na próxima fatura.
                  </p>
                </div>
                <button
                  onClick={confirmUpgrade}
                  className="w-full py-4 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #003884, #0065FF)",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,82,204,0.3)",
                  }}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowUpgradeConfirm(false)}
                  className="w-full py-3.5 rounded-2xl"
                  style={{
                    background: "#F4F7FF",
                    color: "#6B7A99",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsLayout>
  );
}

import React, { useState } from "react";
import {
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  ShieldAlert,
  Megaphone,
  Clock,
  BellOff,
  Smartphone,
  Mail,
} from "lucide-react";
import { SettingsLayout, SettingsSection, Toggle } from "./SettingsLayout";
import { motion, AnimatePresence } from "motion/react";

const BLUE = "#0052CC";

interface NotifGroup {
  title: string;
  items: {
    key: string;
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    sublabel: string;
    color?: string;
  }[];
}

export function SettingsNotificacoes() {
  const [saved, setSaved] = useState(false);
  const [quietMode, setQuietMode] = useState(false);
  const [reminderTime, setReminderTime] = useState("30");

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true,
    email: true,
    sessao_lembrete: true,
    sessao_nova: true,
    sessao_cancelada: true,
    paciente_novo: true,
    paciente_avanco: false,
    relatorio_semanal: true,
    relatorio_mensal: false,
    sistema_updates: false,
    sistema_seguranca: true,
  });

  const set = (key: string) => (v: boolean) => setToggles((p) => ({ ...p, [key]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const groups: NotifGroup[] = [
    {
      title: "Canais de Notificação",
      items: [
        { key: "push", icon: <Smartphone size={16} color="#0052CC" />, iconBg: "#EBF3FF", label: "Notificações Push", sublabel: "Alertas no dispositivo" },
        { key: "email", icon: <Mail size={16} color="#36B37E" />, iconBg: "#ECFDF5", label: "Notificações por E-mail", sublabel: "Resumos e alertas por e-mail" },
      ],
    },
    {
      title: "Sessões",
      items: [
        { key: "sessao_lembrete", icon: <Clock size={16} color="#FFAB00" />, iconBg: "#FFFBEB", label: "Lembrete de sessão", sublabel: "Antes da sessão agendada" },
        { key: "sessao_nova", icon: <Calendar size={16} color="#0052CC" />, iconBg: "#EBF3FF", label: "Nova sessão agendada", sublabel: "Quando um paciente agenda" },
        { key: "sessao_cancelada", icon: <BellOff size={16} color="#FF5630" />, iconBg: "#FFF0EC", label: "Sessão cancelada", sublabel: "Alertas de cancelamento", color: "#FF5630" },
      ],
    },
    {
      title: "Pacientes",
      items: [
        { key: "paciente_novo", icon: <Bell size={16} color="#998DD9" />, iconBg: "#F3F0FF", label: "Novo paciente cadastrado", sublabel: "Ao adicionar um novo paciente" },
        { key: "paciente_avanco", icon: <MessageSquare size={16} color="#36B37E" />, iconBg: "#ECFDF5", label: "Avanço significativo", sublabel: "Quando paciente atinge marcos" },
      ],
    },
    {
      title: "Relatórios",
      items: [
        { key: "relatorio_semanal", icon: <FileText size={16} color="#0052CC" />, iconBg: "#EBF3FF", label: "Relatório semanal", sublabel: "Toda segunda-feira às 08:00" },
        { key: "relatorio_mensal", icon: <FileText size={16} color="#6B7A99" />, iconBg: "#F4F7FF", label: "Relatório mensal", sublabel: "Primeiro dia do mês" },
      ],
    },
    {
      title: "Sistema",
      items: [
        { key: "sistema_updates", icon: <Megaphone size={16} color="#6B7A99" />, iconBg: "#F4F7FF", label: "Novidades do FONO-IA", sublabel: "Atualizações e novas funcionalidades" },
        { key: "sistema_seguranca", icon: <ShieldAlert size={16} color="#FF5630" />, iconBg: "#FFF0EC", label: "Alertas de segurança", sublabel: "Acessos e atividades suspeitas" },
      ],
    },
  ];

  const activeCount = Object.values(toggles).filter(Boolean).length;

  return (
    <SettingsLayout
      title="Notificações"
      subtitle={`${activeCount} de ${Object.keys(toggles).length} ativas`}
    >
      {/* Saved toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
          >
            <Bell size={16} color="#36B37E" />
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: "#065F46" }}>
              Preferências salvas!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status card */}
      <div
        className="rounded-3xl p-4 mb-5 flex items-center justify-between"
        style={{ background: toggles.push ? "linear-gradient(135deg, #EBF3FF, #DBEAFE)" : "#F4F7FF", border: "1.5px solid #DBEAFE" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: toggles.push ? BLUE : "#B0BAD3" }}>
            <Bell size={18} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: "#1A2B5F" }}>
              {toggles.push ? "Notificações ativas" : "Notificações desativadas"}
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>
              {toggles.push ? "Você está recebendo alertas" : "Ative para não perder avisos"}
            </p>
          </div>
        </div>
        <Toggle value={toggles.push} onChange={set("push")} />
      </div>

      {/* Quiet hours */}
      <SettingsSection title="Modo Silencioso">
        <div className="px-4 py-3.5 flex items-center gap-3" style={{ borderBottom: "1px solid #EBF3FF" }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "#F3F0FF" }}>
            <BellOff size={16} color="#998DD9" />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500, color: "#1A2B5F" }}>
              Horário de silêncio
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>
              22:00 – 07:00
            </p>
          </div>
          <Toggle value={quietMode} onChange={setQuietMode} color="#998DD9" />
        </div>
        <div className="px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "#FFFBEB" }}>
            <Clock size={16} color="#FFAB00" />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500, color: "#1A2B5F" }}>
              Lembrete antecipado
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>
              Avisar antes da sessão
            </p>
          </div>
          <select
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: BLUE,
              background: "#EBF3FF",
              border: "none",
              borderRadius: 10,
              padding: "4px 8px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">1 hora</option>
            <option value="120">2 horas</option>
          </select>
        </div>
      </SettingsSection>

      {/* Toggle groups */}
      {groups.slice(1).map((group) => (
        <SettingsSection key={group.title} title={group.title}>
          {group.items.map((item, idx) => (
            <div
              key={item.key}
              className="px-4 py-3.5 flex items-center gap-3"
              style={{ borderBottom: idx < group.items.length - 1 ? "1px solid #EBF3FF" : "none" }}
            >
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500, color: "#1A2B5F" }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>
                  {item.sublabel}
                </p>
              </div>
              <Toggle value={toggles[item.key]} onChange={set(item.key)} color={item.color || BLUE} />
            </div>
          ))}
        </SettingsSection>
      ))}

      <button
        onClick={handleSave}
        className="w-full py-4 rounded-2xl transition-all active:scale-95 mt-2"
        style={{
          background: "linear-gradient(135deg, #003884, #0065FF)",
          color: "#fff",
          fontFamily: "'Poppins', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,82,204,0.3)",
        }}
      >
        Salvar Preferências
      </button>
    </SettingsLayout>
  );
}

import React, { useState } from "react";
import {
  ShieldCheck,
  Eye,
  BarChart2,
  Download,
  Trash2,
  FileText,
  ExternalLink,
  Lock,
  Check,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { SettingsLayout, SettingsSection, Toggle } from "./SettingsLayout";
import { motion, AnimatePresence } from "motion/react";

const BLUE = "#0052CC";

export function SettingsPrivacidade() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);
  const [consentSaved, setConsentSaved] = useState(false);

  const [consents, setConsents] = useState({
    analytics: true,
    improvement: true,
    marketing: false,
    thirdParty: false,
    aiTraining: false,
  });

  const set = (key: keyof typeof consents) => (v: boolean) =>
    setConsents((p) => ({ ...p, [key]: v }));

  const handleExport = () => {
    setExportRequested(true);
    setTimeout(() => setExportRequested(false), 4000);
  };

  const handleSaveConsent = () => {
    setConsentSaved(true);
    setTimeout(() => setConsentSaved(false), 3000);
  };

  return (
    <SettingsLayout title="Privacidade & LGPD" subtitle="Controle seus dados pessoais">

      {/* LGPD badge */}
      <div
        className="rounded-3xl p-4 mb-5 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, #EBF3FF, #DBEAFE)", border: "1.5px solid #93C5FD" }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: BLUE }}>
          <ShieldCheck size={22} color="white" />
        </div>
        <div>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: "#1A2B5F" }}>
            Protegido pela LGPD
          </p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 400, color: "#6B7A99", lineHeight: 1.5 }}>
            Lei nº 13.709/2018 · Seus dados são tratados com segurança e transparência.
          </p>
        </div>
      </div>

      {/* Consent toasts */}
      <AnimatePresence>
        {consentSaved && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
          >
            <Check size={16} color="#36B37E" />
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: "#065F46" }}>
              Preferências de privacidade salvas!
            </p>
          </motion.div>
        )}
        {exportRequested && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: "#EBF3FF", border: "1.5px solid #93C5FD" }}
          >
            <Download size={16} color={BLUE} />
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: "#1A2B5F" }}>
              Exportação em andamento — você receberá um e-mail em breve.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data consents */}
      <SettingsSection title="Consentimentos de Dados">
        {[
          {
            key: "analytics" as const,
            icon: <BarChart2 size={15} color="#0052CC" />, iconBg: "#EBF3FF",
            label: "Análise de uso",
            sublabel: "Melhora sua experiência com métricas anônimas",
          },
          {
            key: "improvement" as const,
            icon: <Eye size={15} color="#36B37E" />, iconBg: "#ECFDF5",
            label: "Melhoria do produto",
            sublabel: "Feedback de funcionalidades para nossos times",
          },
          {
            key: "marketing" as const,
            icon: <FileText size={15} color="#FFAB00" />, iconBg: "#FFFBEB",
            label: "Comunicações de marketing",
            sublabel: "E-mails sobre novos planos e recursos",
          },
          {
            key: "thirdParty" as const,
            icon: <ExternalLink size={15} color="#FF5630" />, iconBg: "#FFF0EC",
            label: "Compartilhamento com parceiros",
            sublabel: "Dados compartilhados com parceiros integrados",
          },
          {
            key: "aiTraining" as const,
            icon: <Lock size={15} color="#998DD9" />, iconBg: "#F3F0FF",
            label: "Treinamento de IA",
            sublabel: "Dados anonimizados para aprimorar o modelo",
          },
        ].map((item, idx, arr) => (
          <div
            key={item.key}
            className="px-4 py-3.5 flex items-center gap-3"
            style={{ borderBottom: idx < arr.length - 1 ? "1px solid #EBF3FF" : "none" }}
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
              {item.icon}
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: "#1A2B5F" }}>{item.label}</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>{item.sublabel}</p>
            </div>
            <Toggle value={consents[item.key]} onChange={set(item.key)} />
          </div>
        ))}
      </SettingsSection>

      <button
        onClick={handleSaveConsent}
        className="w-full py-3.5 rounded-2xl mb-5 transition-all active:scale-95"
        style={{
          background: "linear-gradient(135deg, #003884, #0065FF)",
          color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700,
          border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,82,204,0.28)",
        }}
      >
        Salvar Consentimentos
      </button>

      {/* Seus direitos */}
      <SettingsSection title="Seus Direitos (Art. 18 LGPD)">
        <button
          onClick={handleExport}
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left transition-all"
          style={{ background: "none", border: "none", borderBottom: "1px solid #EBF3FF", cursor: "pointer" }}
        >
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "#EBF3FF" }}>
            <Download size={16} color={BLUE} />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500, color: "#1A2B5F" }}>Exportar meus dados</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>Receba um arquivo com todos os seus dados</p>
          </div>
          <ChevronRight size={16} color="#B0BAD3" />
        </button>

        {[
          { label: "Política de Privacidade", sublabel: "Atualizada em 01 Jan 2026", icon: <FileText size={16} color="#6B7A99" />, iconBg: "#F4F7FF" },
          { label: "Termos de Uso", sublabel: "Versão 3.2", icon: <FileText size={16} color="#6B7A99" />, iconBg: "#F4F7FF" },
          { label: "Acordo de Processamento (DPA)", sublabel: "LGPD & GDPR compliant", icon: <ShieldCheck size={16} color="#36B37E" />, iconBg: "#ECFDF5" },
        ].map((item, idx, arr) => (
          <button
            key={item.label}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
            style={{ background: "none", border: "none", borderBottom: idx < arr.length - 1 ? "1px solid #EBF3FF" : "none", cursor: "pointer" }}
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: item.iconBg }}>
              {item.icon}
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500, color: "#1A2B5F" }}>{item.label}</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>{item.sublabel}</p>
            </div>
            <ExternalLink size={14} color="#B0BAD3" />
          </button>
        ))}
      </SettingsSection>

      {/* Danger zone */}
      <SettingsSection title="Zona de Perigo">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full px-4 py-4 flex items-center gap-3 text-left"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "#FFF0EC" }}>
            <Trash2 size={16} color="#FF5630" />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: "#FF5630" }}>Excluir minha conta</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#B0BAD3", fontWeight: 400 }}>Esta ação é irreversível</p>
          </div>
          <ChevronRight size={16} color="#FF5630" />
        </button>
      </SettingsSection>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-end justify-center z-50"
            style={{ background: "rgba(0,0,0,0.45)", maxWidth: 430, margin: "0 auto" }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              className="w-full rounded-t-3xl p-6"
              style={{ background: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-3xl flex items-center justify-center" style={{ background: "#FFF0EC" }}>
                  <AlertTriangle size={26} color="#FF5630" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: "#1A2B5F", marginBottom: 6 }}>
                    Excluir conta?
                  </h3>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 400, color: "#6B7A99", lineHeight: 1.6 }}>
                    Todos os seus dados, pacientes e sessões serão <strong>permanentemente removidos</strong>. Esta ação não pode ser desfeita.
                  </p>
                </div>
                <button
                  className="w-full py-4 rounded-2xl"
                  style={{ background: "#FF5630", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  Sim, excluir minha conta
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-3.5 rounded-2xl"
                  style={{ background: "#F4F7FF", color: "#6B7A99", fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" }}
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

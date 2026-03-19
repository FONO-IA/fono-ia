import React, { useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  Youtube,
  BookOpen,
  Zap,
  AlertCircle,
  HelpCircle,
  Star,
} from "lucide-react";
import { SettingsLayout, SettingsSection } from "./SettingsLayout";
import { motion, AnimatePresence } from "motion/react";

const BLUE = "#0052CC";

const faqs = [
  {
    q: "Como funciona a análise de fala por IA?",
    a: "O FONO-IA utiliza modelos de reconhecimento de fala treinados especificamente para português brasileiro, analisando precisão fonética, clareza e entonação. Os resultados são exibidos em tempo real e armazenados no prontuário do paciente.",
  },
  {
    q: "Os dados dos pacientes são seguros?",
    a: "Sim. Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Cumprimos integralmente a LGPD e as diretrizes do CFO para prontuários eletrônicos.",
  },
  {
    q: "Posso usar o FONO-IA offline?",
    a: "No momento, o FONO-IA requer conexão para análise de IA e sincronização de dados. Estamos desenvolvendo modo offline para uma próxima versão.",
  },
  {
    q: "Como exportar os relatórios dos pacientes?",
    a: "Acesse o perfil do paciente > aba Relatório > botão 'Exportar PDF'. O relatório inclui gráfico de evolução, lista de gravações e análise fonoaudiológica.",
  },
  {
    q: "É possível cadastrar mais de um profissional na mesma clínica?",
    a: "Sim, no plano Enterprise. O painel clínico permite múltiplos usuários com diferentes níveis de acesso (Administrador, Fonoaudiólogo, Estagiário).",
  },
  {
    q: "Como cancelar minha assinatura?",
    a: "Acesse Configurações > Plano & Assinatura > Cancelar. Você manterá acesso até o fim do período pago. Seus dados ficam disponíveis por 90 dias após o cancelamento.",
  },
];

export function SettingsSuporte() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({ subject: "", message: "", type: "duvida" });

  const handleSend = () => {
    if (!form.subject || !form.message) return;
    setFormSent(true);
    setForm({ subject: "", message: "", type: "duvida" });
    setTimeout(() => setFormSent(false), 5000);
  };

  return (
    <SettingsLayout title="Suporte" subtitle="Estamos aqui para ajudar">

      {/* Contact cards */}
      <div className="flex gap-3 mb-5">
        {[
          { icon: <MessageCircle size={20} color="#fff" />, label: "Chat ao vivo", sublabel: "Resp. em ~2 min", bg: "linear-gradient(135deg, #003884, #0065FF)", action: () => alert("Iniciando chat...") },
          { icon: <Phone size={20} color="#fff" />, label: "Ligar", sublabel: "(11) 3000-4000", bg: "linear-gradient(135deg, #36B37E, #57D9A3)", action: () => alert("Ligando...") },
          { icon: <Mail size={20} color="#fff" />, label: "E-mail", sublabel: "Em até 24h", bg: "linear-gradient(135deg, #FF7452, #FFAB00)", action: () => alert("Abrindo e-mail...") },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="flex-1 flex flex-col items-center gap-2 p-4 rounded-3xl transition-all active:scale-90"
            style={{ background: item.bg, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              {item.icon}
            </div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 700, color: "#fff" }}>{item.label}</p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>{item.sublabel}</p>
          </button>
        ))}
      </div>

      {/* WhatsApp */}
      <button
        onClick={() => alert("Abrindo WhatsApp...")}
        className="w-full flex items-center gap-4 p-4 rounded-3xl mb-5 transition-all active:scale-95"
        style={{ background: "#ECFDF5", border: "2px solid #A7F3D0", cursor: "pointer" }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#25D366" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2C6.03 2 2 6.03 2 11c0 1.64.43 3.18 1.18 4.52L2 20l4.62-1.21A8.93 8.93 0 0011 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm4.42 12.42c-.19.53-.95 1-1.56 1.13-.41.09-.95.16-2.77-.59-2.33-.95-3.83-3.28-3.95-3.44-.12-.16-.95-1.26-.95-2.41 0-1.15.6-1.71.81-1.95.21-.24.46-.3.61-.3.15 0 .3 0 .43.01.14.01.33-.05.51.39.19.45.65 1.58.71 1.7.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.32-.36.43-.12.12-.24.25-.1.49.14.24.62.99 1.33 1.6.91.8 1.68 1.04 1.92 1.16.24.12.38.1.52-.06.14-.16.59-.69.75-.93.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.57-.13 1.1z" fill="white" />
          </svg>
        </div>
        <div className="flex-1">
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: "#065F46" }}>WhatsApp Suporte</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: "#36B37E", fontWeight: 400 }}>
            Atendimento seg–sex, 08h–18h
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#A7F3D0" }}>
          <ChevronDown size={16} color="#36B37E" style={{ transform: "rotate(-90deg)" }} />
        </div>
      </button>

      {/* Resources */}
      <SettingsSection title="Recursos">
        {[
          { icon: <BookOpen size={16} color={BLUE} />, iconBg: "#EBF3FF", label: "Central de ajuda", sublabel: "Artigos e tutoriais passo a passo" },
          { icon: <Youtube size={16} color="#FF5630" />, iconBg: "#FFF0EC", label: "Vídeo-tutoriais", sublabel: "Canal FONO-IA no YouTube" },
          { icon: <Zap size={16} color="#FFAB00" />, iconBg: "#FFFBEB", label: "Novidades do sistema", sublabel: "Ver o que há de novo na versão 2.4" },
        ].map((item, idx) => (
          <button
            key={item.label}
            className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
            style={{ background: "none", border: "none", borderBottom: idx < 2 ? "1px solid #EBF3FF" : "none", cursor: "pointer" }}
          >
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: item.iconBg }}>
              {item.icon}
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500, color: "#1A2B5F" }}>{item.label}</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#6B7A99", fontWeight: 400 }}>{item.sublabel}</p>
            </div>
            <ChevronDown size={16} color="#B0BAD3" style={{ transform: "rotate(-90deg)" }} />
          </button>
        ))}
      </SettingsSection>

      {/* FAQ */}
      <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 600, color: "#6B7A99", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>
        Perguntas Frequentes
      </p>
      <div
        className="rounded-3xl overflow-hidden mb-5"
        style={{ background: "#ffffff", border: "1.5px solid #DBEAFE", boxShadow: "0 2px 12px rgba(0,82,204,0.05)" }}
      >
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ borderBottom: idx < faqs.length - 1 ? "1px solid #EBF3FF" : "none" }}>
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full px-4 py-4 flex items-start gap-3 text-left"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#EBF3FF" }}>
                <HelpCircle size={14} color={BLUE} />
              </div>
              <p className="flex-1" style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: "#1A2B5F", lineHeight: 1.4 }}>
                {faq.q}
              </p>
              {openFaq === idx
                ? <ChevronUp size={16} color={BLUE} className="flex-shrink-0 mt-0.5" />
                : <ChevronDown size={16} color="#B0BAD3" className="flex-shrink-0 mt-0.5" />}
            </button>
            <AnimatePresence>
              {openFaq === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-4 pb-4 pl-14">
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 400, color: "#6B7A99", lineHeight: 1.7 }}>
                      {faq.a}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Contact form */}
      <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 600, color: "#6B7A99", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, paddingLeft: 4 }}>
        Enviar Mensagem
      </p>

      <AnimatePresence>
        {formSent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
          >
            <CheckCircle size={16} color="#36B37E" />
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: "#065F46" }}>
              Mensagem enviada! Responderemos em até 24h.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="rounded-3xl p-4 mb-5"
        style={{ background: "#ffffff", border: "1.5px solid #DBEAFE" }}
      >
        {/* Type selector */}
        <div className="flex gap-2 mb-4">
          {[
            { value: "duvida", label: "Dúvida", icon: <HelpCircle size={12} /> },
            { value: "bug", label: "Erro", icon: <AlertCircle size={12} /> },
            { value: "sugestao", label: "Sugestão", icon: <Zap size={12} /> },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setForm((f) => ({ ...f, type: t.value }))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-1 justify-center transition-all"
              style={{
                background: form.type === t.value ? BLUE : "#F4F7FF",
                color: form.type === t.value ? "#fff" : "#6B7A99",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                border: `1.5px solid ${form.type === t.value ? BLUE : "#DBEAFE"}`,
                cursor: "pointer",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <input
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          placeholder="Assunto"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "2px solid #DBEAFE",
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            color: "#1A2B5F",
            fontWeight: 400,
            background: "#FAFCFF",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 12,
          }}
          onFocus={(e) => (e.target.style.borderColor = BLUE)}
          onBlur={(e) => (e.target.style.borderColor = "#DBEAFE")}
        />
        <textarea
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Descreva sua dúvida ou problema com o máximo de detalhes..."
          rows={4}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            border: "2px solid #DBEAFE",
            fontFamily: "'Poppins', sans-serif",
            fontSize: 13,
            color: "#1A2B5F",
            fontWeight: 400,
            background: "#FAFCFF",
            outline: "none",
            resize: "none",
            boxSizing: "border-box",
            marginBottom: 12,
          }}
          onFocus={(e) => (e.target.style.borderColor = BLUE)}
          onBlur={(e) => (e.target.style.borderColor = "#DBEAFE")}
        />
        <button
          onClick={handleSend}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            background: form.subject && form.message ? "linear-gradient(135deg, #003884, #0065FF)" : "#D1D9E8",
            color: "#fff",
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            cursor: form.subject && form.message ? "pointer" : "default",
            boxShadow: form.subject && form.message ? "0 4px 14px rgba(0,82,204,0.28)" : "none",
          }}
        >
          <Send size={16} />
          Enviar mensagem
        </button>
      </div>

      {/* App rating */}
      <SettingsSection title="Avaliar o FONO-IA">
        <div className="px-4 py-4 flex flex-col items-center gap-3">
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 400, color: "#6B7A99", textAlign: "center" }}>
            Quanto você gosta do FONO-IA?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, transition: "transform 0.15s" }}
              >
                <Star
                  size={32}
                  fill={s <= (hoverRating || rating) ? "#FFD700" : "none"}
                  color={s <= (hoverRating || rating) ? "#FFD700" : "#D1D9E8"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: rating >= 4 ? "#36B37E" : "#FFAB00" }}
            >
              {rating === 5 ? "Incrível, obrigado! 🎉" : rating === 4 ? "Que ótimo! 😊" : rating === 3 ? "Vamos melhorar! 💪" : "Nos ajude a evoluir 🙏"}
            </motion.p>
          )}
        </div>
      </SettingsSection>

      {/* Version info */}
      <div className="flex flex-col items-center gap-1 mt-4">
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: "#B0BAD3", fontWeight: 500 }}>FONO-IA versão 2.4.0</p>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#B0BAD3", fontWeight: 400 }}>Build 2026.02.26 · © 2026 FONO-IA</p>
      </div>
    </SettingsLayout>
  );
}

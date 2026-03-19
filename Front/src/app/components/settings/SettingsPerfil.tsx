import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { SettingsLayout, SettingsSection } from "./SettingsLayout";
import {
  Camera,
  User,
  Stethoscope,
  Hash,
  Building2,
  MapPin,
  Phone,
  Mail,
  Check,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const BLUE = "#0052CC";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  type?: string;
  prefix?: string;
}

function Field({ label, value, onChange, icon, placeholder, type = "text", prefix }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-4">
      <label
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          color: focused ? BLUE : "#6B7A99",
          display: "block",
          marginBottom: 6,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          transition: "color 0.2s",
        }}
      >
        {label}
      </label>
      <div
        className="flex items-center gap-3 px-4 rounded-2xl transition-all duration-200"
        style={{
          border: `2px solid ${focused ? BLUE : "#DBEAFE"}`,
          background: focused ? "#FAFCFF" : "#ffffff",
          height: 52,
          boxShadow: focused ? "0 0 0 4px rgba(0,82,204,0.08)" : "none",
        }}
      >
        <span style={{ color: focused ? BLUE : "#B0BAD3", transition: "color 0.2s", flexShrink: 0 }}>{icon}</span>
        {prefix && (
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#6B7A99", fontWeight: 500 }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
  );
}

export function SettingsPerfil() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "Dr. Paulo Andrade",
    specialty: "Fonoaudiologia Clínica",
    crfa: "6-7832",
    clinic: "Clínica Voz & Fala",
    address: "Rua das Flores, 142 – São Paulo, SP",
    phone: "(11) 99234-5678",
    email: "dr.paulo@clinica.com",
    bio: "Especialista em disfonia, gagueira e atrasos de linguagem em crianças.",
  });

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <SettingsLayout title="Perfil Profissional" subtitle="Gerencie suas informações">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6 pt-2">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, #003884, #0065FF)" }}
          >
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 30, fontWeight: 700, color: "#fff" }}>PA</span>
          </div>
          <button
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl flex items-center justify-center shadow-md transition-all active:scale-90"
            style={{ background: BLUE, border: "2.5px solid #fff", cursor: "pointer" }}
            onClick={() => setEditing(true)}
          >
            <Camera size={14} color="white" />
          </button>
        </div>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 600, color: "#1A2B5F", marginTop: 14 }}>
          {form.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="px-3 py-1 rounded-full"
            style={{ background: "#EBF3FF", fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 600, color: BLUE }}
          >
            {form.specialty}
          </span>
          <span
            className="px-3 py-1 rounded-full"
            style={{ background: "#F4F7FF", fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 500, color: "#6B7A99" }}
          >
            CRFa {form.crfa}
          </span>
        </div>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 mt-3 px-4 py-2 rounded-xl transition-all active:scale-95"
            style={{ background: "#EBF3FF", border: "none", cursor: "pointer" }}
          >
            <Pencil size={13} color={BLUE} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: BLUE }}>
              Editar perfil
            </span>
          </button>
        )}
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
          >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "#36B37E" }}>
              <Check size={14} color="white" strokeWidth={2.5} />
            </div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, color: "#065F46" }}>
              Perfil atualizado com sucesso!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <SettingsSection title="Dados Pessoais">
        <div className="p-4">
          <Field label="Nome completo" value={form.name} onChange={set("name")} icon={<User size={16} />} placeholder="Seu nome" />
          <Field label="Especialidade" value={form.specialty} onChange={set("specialty")} icon={<Stethoscope size={16} />} placeholder="Ex: Fonoaudiologia" />
          <Field label="Nº CRFa" value={form.crfa} onChange={set("crfa")} icon={<Hash size={16} />} placeholder="0-0000" prefix="CRFa" />
          <div>
            <label style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 600, color: "#6B7A99", display: "block", marginBottom: 6, letterSpacing: 0.4, textTransform: "uppercase" }}>
              Mini bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => set("bio")(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                borderRadius: 16,
                border: "2px solid #DBEAFE",
                padding: "12px 14px",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: "#1A2B5F",
                background: "#ffffff",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = BLUE)}
              onBlur={(e) => (e.target.style.borderColor = "#DBEAFE")}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Dados da Clínica">
        <div className="p-4">
          <Field label="Nome da clínica" value={form.clinic} onChange={set("clinic")} icon={<Building2 size={16} />} placeholder="Nome da clínica" />
          <Field label="Endereço" value={form.address} onChange={set("address")} icon={<MapPin size={16} />} placeholder="Rua, número – Cidade, Estado" />
        </div>
      </SettingsSection>

      <SettingsSection title="Contato">
        <div className="p-4">
          <Field label="Telefone" value={form.phone} onChange={set("phone")} icon={<Phone size={16} />} placeholder="(00) 00000-0000" type="tel" />
          <Field label="E-mail" value={form.email} onChange={set("email")} icon={<Mail size={16} />} placeholder="seu@email.com" type="email" />
        </div>
      </SettingsSection>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
        style={{
          background: "linear-gradient(135deg, #003884, #0065FF)",
          color: "#fff",
          fontFamily: "'Poppins', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,82,204,0.35)",
        }}
      >
        <Check size={18} />
        Salvar Alterações
      </button>

      <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: "#B0BAD3", fontWeight: 400, textAlign: "center", marginTop: 12 }}>
        Última atualização: 26 Fev 2026
      </p>
    </SettingsLayout>
  );
}

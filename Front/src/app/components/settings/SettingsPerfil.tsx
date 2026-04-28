import React, { useEffect, useState } from "react";
import { SettingsLayout, SettingsSection } from "./SettingsLayout";
import {
  User,
  Hash,
  Phone,
  Mail,
  Check,
  Pencil,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getMe, alterarSenha } from "../../../services/auth";

const BLUE = "#0052CC";

type PerfilForm = {
  nome: string;
  cpf: string;
  crfa: string;
  telefone: string;
  email: string;
};

function Field({
  label,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-4">
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: focused ? BLUE : "#6B7A99",
          display: "block",
          marginBottom: 6,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>

      <div
        className="flex items-center gap-3 px-4 rounded-2xl"
        style={{
          border: `2px solid ${focused ? BLUE : "#DBEAFE"}`,
          background: disabled ? "#F4F7FF" : "#ffffff",
          height: 52,
        }}
      >
        <span style={{ color: focused ? BLUE : "#B0BAD3", flexShrink: 0 }}>
          {icon}
        </span>

        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "#1A2B5F",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
}

function initials(nome: string) {
  return (
    nome
      ?.trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "FO"
  );
}

export function SettingsPerfil() {
  const [saved, setSaved] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<PerfilForm>({
    nome: "",
    cpf: "",
    crfa: "",
    telefone: "",
    email: "",
  });

  const [senha, setSenha] = useState({
    senha_atual: "",
    nova_senha: "",
    confirmar_senha: "",
  });

  const set = (key: keyof PerfilForm) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  const setSenhaField = (key: keyof typeof senha) => (v: string) =>
    setSenha((prev) => ({ ...prev, [key]: v }));

  useEffect(() => {
    async function carregarPerfil() {
      try {
        setLoading(true);

        const data = await getMe();

        setForm({
          nome: data.nome || "",
          cpf: data.cpf || "",
          crfa: data.crfa || "",
          telefone: data.telefone || "",
          email: data.email || "",
        });
      } catch (error) {
        setSaved("Não foi possível carregar os dados do perfil.");
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
  }, []);

  const handleSave = () => {
    setSaved("Perfil atualizado com sucesso!");
    setEditing(false);
    setTimeout(() => setSaved(""), 3000);
  };

  const handleAlterarSenha = async () => {
    if (!senha.senha_atual || !senha.nova_senha || !senha.confirmar_senha) {
      setSaved("Preencha todos os campos de senha.");
      return;
    }

    if (senha.nova_senha !== senha.confirmar_senha) {
      setSaved("A nova senha e a confirmação não conferem.");
      return;
    }

    try {
      await alterarSenha({
        senha_atual: senha.senha_atual,
        nova_senha: senha.nova_senha,
      });

      setSenha({
        senha_atual: "",
        nova_senha: "",
        confirmar_senha: "",
      });

      setSaved("Senha alterada com sucesso!");
      setTimeout(() => setSaved(""), 3000);
    } catch (error) {
      setSaved(error instanceof Error ? error.message : "Erro ao alterar senha.");
    }
  };

  if (loading) {
    return (
      <SettingsLayout title="Perfil Profissional" subtitle="Carregando dados...">
        <p style={{ color: "#6B7A99", padding: 16 }}>Carregando perfil...</p>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Perfil Profissional" subtitle="Gerencie suas informações">
      <div className="flex flex-col items-center mb-6 pt-2">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-md"
          style={{ background: "linear-gradient(135deg, #003884, #0065FF)" }}
        >
          <span style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}>
            {initials(form.nome)}
          </span>
        </div>

        <p style={{ fontSize: 16, fontWeight: 600, color: "#1A2B5F", marginTop: 14 }}>
          {form.nome || "Fonoaudiólogo"}
        </p>

        <span
          className="px-3 py-1 rounded-full mt-1"
          style={{
            background: "#F4F7FF",
            fontSize: 11,
            fontWeight: 500,
            color: "#6B7A99",
          }}
        >
          CRFa {form.crfa || "-"}
        </span>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 mt-3 px-4 py-2 rounded-xl"
            style={{ background: "#EBF3FF", border: "none", cursor: "pointer" }}
          >
            <Pencil size={13} color={BLUE} />
            <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>
              Editar perfil
            </span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
            style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "#36B37E" }}
            >
              <Check size={14} color="white" strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#065F46" }}>
              {saved}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsSection title="Dados do Cadastro">
        <div className="p-4">
          <Field
            label="Nome completo"
            value={form.nome}
            onChange={set("nome")}
            icon={<User size={16} />}
            placeholder="Nome completo"
            disabled={!editing}
          />

          <Field
            label="CPF"
            value={form.cpf}
            onChange={set("cpf")}
            icon={<User size={16} />}
            placeholder="CPF"
            disabled
          />

          <Field
            label="CRFa"
            value={form.crfa}
            onChange={set("crfa")}
            icon={<Hash size={16} />}
            placeholder="CRFa"
            disabled={!editing}
          />

          <Field
            label="Telefone"
            value={form.telefone}
            onChange={set("telefone")}
            icon={<Phone size={16} />}
            placeholder="Telefone"
            type="tel"
            disabled={!editing}
          />

          <Field
            label="E-mail"
            value={form.email}
            onChange={set("email")}
            icon={<Mail size={16} />}
            placeholder="E-mail"
            type="email"
            disabled={!editing}
          />
        </div>
      </SettingsSection>

      {editing && (
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2"
          style={{
            background: "linear-gradient(135deg, #003884, #0065FF)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Check size={18} />
          Salvar Alterações
        </button>
      )}

      <SettingsSection title="Alterar Senha">
        <div className="p-4">
          <Field
            label="Senha atual"
            value={senha.senha_atual}
            onChange={setSenhaField("senha_atual")}
            icon={<Lock size={16} />}
            placeholder="Digite sua senha atual"
            type="password"
          />

          <Field
            label="Nova senha"
            value={senha.nova_senha}
            onChange={setSenhaField("nova_senha")}
            icon={<Lock size={16} />}
            placeholder="Digite a nova senha"
            type="password"
          />

          <Field
            label="Confirmar nova senha"
            value={senha.confirmar_senha}
            onChange={setSenhaField("confirmar_senha")}
            icon={<Lock size={16} />}
            placeholder="Confirme a nova senha"
            type="password"
          />

          <button
            onClick={handleAlterarSenha}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2"
            style={{
              background: "#F4F7FF",
              color: BLUE,
              fontSize: 15,
              fontWeight: 700,
              border: "2px solid #DBEAFE",
              cursor: "pointer",
            }}
          >
            <Lock size={18} />
            Alterar Senha
          </button>
        </div>
      </SettingsSection>
    </SettingsLayout>
  );
}
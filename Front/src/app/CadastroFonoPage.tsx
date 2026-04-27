import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  UserRound,
  Shield,
  Phone,
  Mail,
  BadgeCheck,
  Save,
  AlertCircle,
} from "lucide-react";
import { criarFonoaudiologo } from "../services/fonoaudiologos";
import { formatCPF, formatPhone, onlyDigits } from "../utils/formatters";


type FormState = {
  nome: string;
  cpf: string;
  crfa: string;
  telefone: string;
  email: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  nome: "",
  cpf: "",
  crfa: "",
  telefone: "",
  email: "",
};

export function CadastroFonoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function generateRandomString(length: number) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setError("");
  }

  function formatCRFa(value: string) {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 15);
  }

  function validateField(field: keyof FormState, value: string): string {
    switch (field) {
      case "nome":
        return !value.trim() ? "Nome é obrigatório." : "";

      case "cpf": {
        if (!value.trim()) return "CPF é obrigatório.";
        const digits = onlyDigits(value);
        if (digits.length !== 11) return "CPF deve ter 11 dígitos.";
        return "";
      }

      case "crfa":
        return !value.trim() ? "CRFa é obrigatório." : "";

      case "telefone": {
        if (!value.trim()) return "Telefone é obrigatório.";
        const digits = onlyDigits(value);
        if (digits.length < 10 || digits.length > 11) {
          return "Telefone deve ter 10 ou 11 dígitos.";
        }
        return "";
      }

      case "email":
        if (!value.trim()) return "Email é obrigatório.";
        return /\S+@\S+\.\S+/.test(value) ? "" : "Email inválido.";

      default:
        return "";
    }
  }

  function validateForm(values: FormState) {
    const errors: FieldErrors = {
      nome: validateField("nome", values.nome),
      cpf: validateField("cpf", values.cpf),
      crfa: validateField("crfa", values.crfa),
      telefone: validateField("telefone", values.telefone),
      email: validateField("email", values.email),
    };

    return errors;
  }

  function hasErrors(errors: FieldErrors) {
    return Object.values(errors).some(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errors = validateForm(form);
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      setError("Corrija os campos destacados para continuar.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const password = generateRandomString(8);



      await criarFonoaudiologo({
        nome: form.nome.trim(),
        cpf: onlyDigits(form.cpf),
        crfa: form.crfa.trim(),
        telefone: onlyDigits(form.telefone),
        email: form.email.trim().toLowerCase(),
        username: form.email.trim().toLowerCase(),
        password,
      });

      navigate("/admin");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar fonoaudiólogo.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full min-h-[52px] rounded-2xl border px-4 text-sm outline-none transition-all";

  function inputStyle(hasError?: boolean): React.CSSProperties {
    return {
      borderColor: hasError ? "#DC2626" : "#DBEAFE",
      background: hasError ? "#FEF2F2" : "#F8FBFF",
      color: "#1A2B5F",
    };
  }

  return (
    <div className="min-h-screen bg-[#F4F7FF] px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 font-medium text-[#0052CC]"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <div className="rounded-[28px] border border-[#DBEAFE] bg-white p-5 sm:p-8 shadow-sm">
          <div className="mb-7">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FF]">
              <BadgeCheck size={26} color="#0052CC" />
            </div>

            <h1 className="text-2xl font-bold text-[#1A2B5F]">
              Cadastro de Fonoaudiólogo
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6B7A99]">
              Preencha os dados do profissional. CPF e telefone serão formatados automaticamente.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              <AlertCircle size={18} className="mt-[1px] shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
            <Field
              label="Nome completo"
              icon={<UserRound size={16} color="#0052CC" />}
              error={fieldErrors.nome}
            >
              <input
                value={form.nome}
                onChange={(e) => updateField("nome", e.target.value)}
                placeholder="Ex: Maria Eduarda Silva"
                className={inputClass}
                style={inputStyle(!!fieldErrors.nome)}
                autoComplete="name"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="CPF"
                icon={<Shield size={16} color="#0052CC" />}
                error={fieldErrors.cpf}
              >
                <input
                  value={form.cpf}
                  onChange={(e) => updateField("cpf", formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className={inputClass}
                  style={inputStyle(!!fieldErrors.cpf)}
                  inputMode="numeric"
                  maxLength={14}
                />
              </Field>

              <Field
                label="CRFa"
                icon={<BadgeCheck size={16} color="#0052CC" />}
                error={fieldErrors.crfa}
              >
                <input
                  value={form.crfa}
                  onChange={(e) => updateField("crfa", formatCRFa(e.target.value))}
                  placeholder="Ex: 00000-0"
                  className={inputClass}
                  style={inputStyle(!!fieldErrors.crfa)}
                  autoCapitalize="characters"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Telefone"
                icon={<Phone size={16} color="#0052CC" />}
                error={fieldErrors.telefone}
              >
                <input
                  value={form.telefone}
                  onChange={(e) =>
                    updateField("telefone", formatPhone(e.target.value))
                  }
                  placeholder="(00) 00000-0000"
                  className={inputClass}
                  style={inputStyle(!!fieldErrors.telefone)}
                  inputMode="numeric"
                  maxLength={15}
                  autoComplete="tel"
                />
              </Field>

              <Field
                label="Email"
                icon={<Mail size={16} color="#0052CC" />}
                error={fieldErrors.email}
              >
                <input
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value.toLowerCase())
                  }
                  placeholder="email@exemplo.com"
                  className={inputClass}
                  style={inputStyle(!!fieldErrors.email)}
                  type="email"
                  autoComplete="email"
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl font-semibold text-white transition-all disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #0052CC, #0065FF)",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 12px 28px rgba(0,82,204,0.18)",
              }}
            >
              <Save size={18} />
              {loading ? "Salvando..." : "Cadastrar fonoaudiólogo"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1A2B5F]">
        {icon}
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
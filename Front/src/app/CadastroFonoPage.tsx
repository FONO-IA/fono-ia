import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { criarFonoaudiologo } from "../services/fonoaudiologos";
import { formatCPF, formatPhone, onlyDigits } from "../utils/formatters";

export function CadastroFonoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    crfa: "",
    telefone: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    if (!form.nome.trim()) return "Nome é obrigatório.";
    if (onlyDigits(form.cpf).length !== 11) return "CPF deve ter 11 dígitos.";
    if (!form.crfa.trim()) return "CRFa é obrigatório.";
    if (onlyDigits(form.telefone).length < 10) return "Telefone inválido.";
    if (!form.email.trim()) return "Email é obrigatório.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Email inválido.";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await criarFonoaudiologo({
        nome: form.nome.trim(),
        cpf: onlyDigits(form.cpf),
        crfa: form.crfa.trim(),
        telefone: onlyDigits(form.telefone),
        email: form.email.trim(),
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

  return (
    <div className="min-h-screen bg-[#F4F7FF] px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-[#0052CC] font-medium"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <div className="bg-white rounded-3xl p-8 border border-[#DBEAFE]">
          <h1 className="text-2xl font-bold text-[#1A2B5F] mb-2">
            Cadastro de Fonoaudiólogo
          </h1>
          <p className="text-sm text-[#6B7A99] mb-6">
            Preencha os dados para cadastrar um novo profissional
          </p>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-2xl border border-[#DBEAFE] px-4 py-3 outline-none"
            />

            <input
              value={form.cpf}
              onChange={(e) => updateField("cpf", formatCPF(e.target.value))}
              placeholder="CPF"
              className="w-full rounded-2xl border border-[#DBEAFE] px-4 py-3 outline-none"
            />

            <input
              value={form.crfa}
              onChange={(e) => updateField("crfa", e.target.value)}
              placeholder="CRFa"
              className="w-full rounded-2xl border border-[#DBEAFE] px-4 py-3 outline-none"
            />

            <input
              value={form.telefone}
              onChange={(e) => updateField("telefone", formatPhone(e.target.value))}
              placeholder="Telefone"
              className="w-full rounded-2xl border border-[#DBEAFE] px-4 py-3 outline-none"
            />

            <input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-[#DBEAFE] px-4 py-3 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3 text-white font-semibold"
              style={{
                background: "linear-gradient(135deg, #0052CC, #0065FF)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Salvando..." : "Cadastrar fonoaudiólogo"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { ArrowLeft, User, Phone, Save } from "lucide-react";
import { criarPaciente, criarResponsavel } from "../services/pacientes";
import {
  onlyDigits,
  calculateAge,
  formatPhone,
  formatCPF,
} from "../utils/formatters";
import { Input } from "./components/Inputs";

type FormDataType = {
  name: string;
  birthDate: string;
  age: string;
  observations: string;
  parentName: string;
  phone: string;
  email: string;
  cpf: string;
};

type ErrorsType = {
  name: string;
  birthDate: string;
  parentName: string;
  phone: string;
  email: string;
  cpf: string;
  general: string;
};

const initialErrors: ErrorsType = {
  name: "",
  birthDate: "",
  parentName: "",
  phone: "",
  email: "",
  cpf: "",
  general: "",
};

export function AddPatient() {
  const navigate = useNavigate();

  const [errors, setErrors] = useState<ErrorsType>(initialErrors);

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    birthDate: "",
    age: "",
    observations: "",
    parentName: "",
    phone: "",
    email: "",
    cpf: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "cpf") {
      const hasLetters = /[^\d.\-]/.test(value);
      const cleaned = onlyDigits(value);

      setErrors((prev) => ({
        ...prev,
        cpf: hasLetters ? "CPF aceita somente números." : "",
        general: "",
      }));

      setFormData((prev) => ({
        ...prev,
        cpf: formatCPF(cleaned),
      }));
      return;
    }

    if (name === "phone") {
      const hasLetters = /[^\d()\-\s]/.test(value);
      const cleaned = onlyDigits(value);

      setErrors((prev) => ({
        ...prev,
        phone: hasLetters ? "Telefone aceita somente números." : "",
        general: "",
      }));

      setFormData((prev) => ({
        ...prev,
        phone: formatPhone(cleaned),
      }));
      return;
    }

    if (name === "birthDate") {
      setErrors((prev) => ({
        ...prev,
        birthDate: "",
        general: "",
      }));

      setFormData((prev) => ({
        ...prev,
        birthDate: value,
        age: calculateAge(value),
      }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const newErrors: ErrorsType = {
      name: "",
      birthDate: "",
      parentName: "",
      phone: "",
      email: "",
      cpf: "",
      general: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Informe o nome do paciente.";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Informe a data de nascimento.";
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Informe o nome do responsável.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Informe o telefone do responsável.";
    } else if (onlyDigits(formData.phone).length < 10) {
      newErrors.phone = "Informe um telefone válido.";
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "Informe o CPF do responsável.";
    } else if (onlyDigits(formData.cpf).length !== 11) {
      newErrors.cpf = "Informe um CPF válido.";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Informe um e-mail válido.";
    }

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors(initialErrors);

      const responsavel = await criarResponsavel({
        nome: formData.parentName.trim(),
        cpf: onlyDigits(formData.cpf),
        email: formData.email.trim() || `sem-email-${Date.now()}@temp.local`,
        telefone: onlyDigits(formData.phone),
      });

      await criarPaciente({
        nome: formData.name.trim(),
        data_nascimento: formData.birthDate,
        observacoes: formData.observations.trim(),
        responsavel: responsavel.id,
      });

      navigate("/admin");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao salvar paciente.";

      const apiErrors: ErrorsType = {
        name: "",
        birthDate: "",
        parentName: "",
        phone: "",
        email: "",
        cpf: "",
        general: "",
      };

      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("cpf")) {
        apiErrors.cpf = message;
      } else if (
        lowerMessage.includes("email") ||
        lowerMessage.includes("e-mail")
      ) {
        apiErrors.email = message;
      } else if (
        lowerMessage.includes("telefone") ||
        lowerMessage.includes("phone")
      ) {
        apiErrors.phone = message;
      } else if (lowerMessage.includes("nome")) {
        apiErrors.parentName = message;
      } else {
        apiErrors.general = message;
      }

      setErrors(apiErrors);
    }
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="flex min-h-screen"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: "#F4F7FF",
        }}
      >
        <div
          className="hidden md:flex md:flex-col md:w-80 lg:w-96 min-h-screen"
          style={{
            background:
              "linear-gradient(180deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
          }}
        >
          <div className="p-8">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 mb-8 transition-all hover:opacity-80"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <ArrowLeft size={20} color="rgba(255,255,255,0.85)" />
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 400,
                }}
              >
                Voltar ao Dashboard
              </span>
            </button>

            <div className="mb-8">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <User size={36} color="#fff" strokeWidth={1.8} />
              </div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                Novo Paciente
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Adicione um novo paciente ao sistema e gere o código de acesso
                automaticamente
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="hidden md:flex md:flex-col md:flex-1 min-h-0">
            <div
              className="px-8 lg:px-12 py-6 border-b border-gray-200"
              style={{ background: "#fff" }}
            >
              <h2
                style={{ fontSize: 24, fontWeight: 700, color: "#1A2B5F" }}
              >
                Cadastro de Paciente
              </h2>
              <p
                style={{ fontSize: 14, color: "#6B7A99", fontWeight: 400 }}
              >
                Preencha os dados abaixo para criar um novo perfil
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-8 lg:px-12 py-8">
              <div className="max-w-4xl pb-8">
                {errors.general && (
                  <div
                    className="mb-6 px-4 py-3 rounded-2xl"
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      color: "#B91C1C",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {errors.general}
                  </div>
                )}

                <div
                  className="rounded-3xl p-6 mb-6"
                  style={{ background: "#fff", border: "1.5px solid #DBEAFE" }}
                >
                  <h3
                    className="flex items-center gap-2 mb-6"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#1A2B5F",
                    }}
                  >
                    <Phone size={20} color="#0052CC" />
                    Responsável
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Input
                        label="Nome do Responsável*"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                        placeholder="Ex: João Silva Santos"
                        error={errors.parentName}
                      />
                    </div>

                    <div>
                      <Input
                        label="Telefone*"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(11) 98765-4321"
                        error={errors.phone}
                      />
                    </div>

                    <div>
                      <Input
                        label="E-mail"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@exemplo.com"
                        error={errors.email}
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        label="CPF do Responsável*"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        error={errors.cpf}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-3xl p-6 mb-6"
                  style={{ background: "#fff", border: "1.5px solid #DBEAFE" }}
                >
                  <h3
                    className="flex items-center gap-2 mb-6"
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#1A2B5F",
                    }}
                  >
                    <User size={20} color="#0052CC" />
                    Dados Pessoais
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Input
                        label="Nome Completo*"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Maria Silva Santos"
                        error={errors.name}
                      />
                    </div>

                    <div>
                      <Input
                        label="Data de Nascimento*"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        error={errors.birthDate}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#000073",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        Idade
                      </label>
                      <input
                        type="text"
                        value={formData.age}
                        readOnly
                        placeholder="Calculada automaticamente"
                        className="w-full px-4 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
                          background: "#F8FAFC",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      />
                    </div>

                    <div className="col-span-2">
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#000073",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        Observações
                      </label>
                      <textarea
                        value={formData.observations}
                        onChange={handleChange}
                        name="observations"
                        placeholder="Informações adicionais sobre o paciente..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-2xl resize-none"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => navigate("/admin")}
                    className="px-8 py-3.5 rounded-2xl transition-all hover:bg-gray-100"
                    style={{
                      background: "#B90000",
                      border: "2px solid #DBEAFE",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{
                      background: "#007200",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Save size={20} />
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="md:hidden flex flex-col flex-1 min-h-screen"
            style={{ background: "#F4F7FF" }}
          >
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

              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 mb-5"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <ArrowLeft size={20} color="rgba(255,255,255,0.85)" />
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 400,
                  }}
                >
                  Voltar
                </span>
              </button>

              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <User size={26} color="#fff" strokeWidth={1.8} />
                </div>
                <div>
                  <h1
                    style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}
                  >
                    Novo Paciente
                  </h1>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 400,
                    }}
                  >
                    Cadastro completo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-10">
              {errors.general && (
                <div
                  className="mb-4 px-4 py-3 rounded-2xl"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    color: "#B91C1C",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {errors.general}
                </div>
              )}

              <div
                className="rounded-3xl p-5 mb-4"
                style={{ background: "#fff", border: "1.5px solid #DBEAFE" }}
              >
                <h3
                  className="flex items-center gap-2 mb-4"
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1A2B5F",
                  }}
                >
                  <User size={18} color="#0052CC" />
                  Dados Pessoais
                </h3>

                <div className="space-y-3">
                  <Input
                    label="Nome Completo*"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Maria Silva Santos"
                    error={errors.name}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Nascimento*"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      error={errors.birthDate}
                    />

                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#6B7A99",
                          marginBottom: 6,
                          display: "block",
                        }}
                      >
                        Idade
                      </label>
                      <input
                        type="text"
                        value={formData.age}
                        readOnly
                        placeholder="Auto"
                        className="w-full px-3 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
                          background: "#F8FAFC",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#6B7A99",
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Observações
                    </label>
                    <textarea
                      value={formData.observations}
                      onChange={handleChange}
                      name="observations"
                      placeholder="Informações adicionais sobre o paciente..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl resize-none"
                      style={{
                        border: "1.5px solid #DBEAFE",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                className="rounded-3xl p-5 mb-4"
                style={{ background: "#fff", border: "1.5px solid #DBEAFE" }}
              >
                <h3
                  className="flex items-center gap-2 mb-4"
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1A2B5F",
                  }}
                >
                  <Phone size={18} color="#0052CC" />
                  Responsável
                </h3>

                <div className="space-y-3">
                  <Input
                    label="Nome do Responsável*"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Ex: João Silva Santos"
                    error={errors.parentName}
                  />

                  <Input
                    label="Telefone*"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 98765-4321"
                    error={errors.phone}
                  />

                  <Input
                    label="E-mail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    error={errors.email}
                  />

                  <Input
                    label="CPF do Responsável*"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    error={errors.cpf}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/admin")}
                  className="px-6 py-3.5 rounded-2xl"
                  style={{
                    background: "#fff",
                    border: "2px solid #DBEAFE",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#6B7A99",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #0052CC, #0065FF)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}
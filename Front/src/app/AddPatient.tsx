import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import {
  ArrowLeft,
  UserRound,
  Calendar,
  FileText,
  Shield,
  Mail,
  Phone,
  Save,
  AlertCircle,
  Baby,
  X,
  CheckCircle2,
} from "lucide-react";
import { criarResponsavel } from "../services/responsaveis";
import { criarPaciente } from "../services/pacientes";
import {
  formatCPF,
  formatPhone,
  onlyDigits,
  calculateAge,
} from "../utils/formatters";

type FormState = {
  nomePaciente: string;
  dataNascimento: string;
  observacoes: string;
  nomeResponsavel: string;
  cpfResponsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  nomePaciente: "",
  dataNascimento: "",
  observacoes: "",
  nomeResponsavel: "",
  cpfResponsavel: "",
  emailResponsavel: "",
  telefoneResponsavel: "",
};

export function AddPatient() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [responsavelCadastrado, setResponsavelCadastrado] = useState<any>(null);
  const [pacientesCadastrados, setPacientesCadastrados] = useState(0);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setGeneralError("");
  }

  function validateField(field: keyof FormState, value: string): string {
    switch (field) {
      case "nomeResponsavel":
        return !value.trim() ? "Nome do responsável é obrigatório." : "";

      case "cpfResponsavel": {
        if (!value.trim()) return "CPF do responsável é obrigatório.";

        const digits = onlyDigits(value);
        if (digits.length !== 11) {
          return "CPF do responsável deve ter 11 dígitos.";
        }

        return "";
      }

      case "telefoneResponsavel": {
        if (!value.trim()) return "Telefone do responsável é obrigatório.";

        const digits = onlyDigits(value);
        if (digits.length < 10 || digits.length > 11) {
          return "Telefone do responsável inválido.";
        }

        return "";
      }

      case "emailResponsavel":
        if (!value.trim()) return "";
        return /\S+@\S+\.\S+/.test(value)
          ? ""
          : "Email do responsável inválido.";

      case "nomePaciente":
        return !value.trim() ? "Nome do paciente é obrigatório." : "";

      case "dataNascimento":
        return !value ? "Data de nascimento é obrigatória." : "";

      case "observacoes":
        return "";

      default:
        return "";
    }
  }

  function validateForm(values: FormState) {
    const nextErrors: FieldErrors = {
      nomeResponsavel: validateField("nomeResponsavel", values.nomeResponsavel),
      cpfResponsavel: validateField("cpfResponsavel", values.cpfResponsavel),
      telefoneResponsavel: validateField(
        "telefoneResponsavel",
        values.telefoneResponsavel,
      ),
      emailResponsavel: validateField(
        "emailResponsavel",
        values.emailResponsavel,
      ),
      nomePaciente: validateField("nomePaciente", values.nomePaciente),
      dataNascimento: validateField("dataNascimento", values.dataNascimento),
      observacoes: "",
    };

    return nextErrors;
  }

  function hasErrors(errors: FieldErrors) {
    return Object.values(errors).some(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errors = validateForm(form);
    setFieldErrors(errors);

    if (hasErrors(errors)) {
      setGeneralError("Corrija os campos destacados para continuar.");
      return;
    }

    try {
      setLoading(true);
      setGeneralError("");

      let responsavel = responsavelCadastrado;

      if (!responsavel) {
        responsavel = await criarResponsavel({
          nome: form.nomeResponsavel.trim(),
          cpf: onlyDigits(form.cpfResponsavel),
          email: form.emailResponsavel.trim(),
          telefone: onlyDigits(form.telefoneResponsavel),
        });

        setResponsavelCadastrado(responsavel);
      }

      await criarPaciente({
        nome: form.nomePaciente.trim(),
        data_nascimento: form.dataNascimento,
        observacoes: form.observacoes.trim(),
        responsavel: String(responsavel.id),
      });

      setPacientesCadastrados((prev) => prev + 1);
      setShowSuccessModal(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar paciente.";
      setGeneralError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleContinueRegistering() {
    setForm((prev) => ({
      ...prev,
      nomePaciente: "",
      dataNascimento: "",
      observacoes: "",
    }));

    setFieldErrors({});
    setGeneralError("");
    setShowSuccessModal(false);
  }

  function handleFinishRegistering() {
    setShowSuccessModal(false);
    navigate("/admin");
  }

  const idadePreview = useMemo(() => {
    return calculateAge(form.dataNascimento);
  }, [form.dataNascimento]);

  const iniciaisPaciente = useMemo(() => {
    if (!form.nomePaciente.trim()) return "PC";

    return form.nomePaciente
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0]?.toUpperCase())
      .join("");
  }, [form.nomePaciente]);

  const inputStyle = (
    hasError?: boolean,
    disabled?: boolean,
  ): React.CSSProperties => ({
    width: "100%",
    minHeight: 52,
    borderRadius: 16,
    border: hasError ? "1.5px solid #DC2626" : "1.5px solid #DBEAFE",
    background: hasError ? "#FEF2F2" : disabled ? "#EEF4FF" : "#F8FBFF",
    padding: "0 16px",
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14,
    color: "#1A2B5F",
    outline: "none",
    opacity: disabled ? 0.78 : 1,
    cursor: disabled ? "not-allowed" : "text",
  });

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="min-h-screen"
        style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
      >
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="xl:grid xl:min-h-screen xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside
              className="hidden xl:block"
              style={{
                background:
                  "linear-gradient(180deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
              }}
            >
              <div className="sticky top-0 flex min-h-screen flex-col p-8">
                <button
                  onClick={() => navigate(-1)}
                  className="mb-8 flex items-center gap-2 transition-all hover:opacity-80"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={20} color="rgba(255,255,255,0.9)" />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
                    Voltar
                  </span>
                </button>

                <div
                  className="rounded-[28px] p-6"
                  style={{ background: "rgba(255,255,255,0.14)" }}
                >
                  <div
                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <Baby size={28} color="#fff" />
                  </div>

                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.15,
                    }}
                  >
                    Novo Paciente
                  </h1>

                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.78)",
                      marginTop: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    Cadastre o responsável uma vez e adicione um ou mais pacientes.
                  </p>

                  <div className="mt-8 space-y-3">
                    {[
                      {
                        label: "Responsável",
                        value: form.nomeResponsavel.trim() || "-",
                      },
                      {
                        label: "Paciente atual",
                        value: form.nomePaciente.trim() || "-",
                      },
                      {
                        label: "Pacientes cadastrados",
                        value: String(pacientesCadastrados),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl p-4"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                      >
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.72)" }}>
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#fff",
                            marginTop: 2,
                            wordBreak: "break-word",
                          }}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <main className="min-w-0">
              <div
                className="xl:hidden px-4 sm:px-6 md:px-8 pt-10 sm:pt-12 pb-8"
                style={{
                  background:
                    "linear-gradient(150deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
                }}
              >
                <button
                  onClick={() => navigate(-1)}
                  className="mb-6 flex items-center gap-2"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <ArrowLeft size={20} color="rgba(255,255,255,0.9)" />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
                    Voltar
                  </span>
                </button>

                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <Baby size={24} color="#fff" />
                  </div>

                  <div className="min-w-0">
                    <h1
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.2,
                      }}
                    >
                      Cadastrar Paciente
                    </h1>
                    <p
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.75)",
                        marginTop: 6,
                        lineHeight: 1.5,
                      }}
                    >
                      Um responsável pode ter vários pacientes
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-12 pb-8 xl:py-10">
                <div className="mx-auto max-w-7xl">
                  {generalError && (
                    <div
                      className="mb-5 rounded-[24px] p-4 flex items-start gap-3"
                      style={{
                        background: "#FEF2F2",
                        border: "1.5px solid #FECACA",
                        color: "#B91C1C",
                      }}
                    >
                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {generalError}
                      </span>
                    </div>
                  )}

                  {responsavelCadastrado && (
                    <div
                      className="mb-5 rounded-[24px] p-4 flex items-start gap-3"
                      style={{
                        background: "#ECFDF5",
                        border: "1.5px solid #BBF7D0",
                        color: "#047857",
                      }}
                    >
                      <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>
                        Responsável cadastrado. Agora você pode adicionar mais pacientes para ele.
                      </span>
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 gap-5 lg:gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]"
                  >
                    <div className="min-w-0 space-y-5 lg:space-y-6">
                      <section
                        className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-8"
                        style={{
                          background: "#fff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                        }}
                      >
                        <h2
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#1A2B5F",
                            marginBottom: 20,
                          }}
                        >
                          Dados do responsável
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                          <div className="md:col-span-2">
                            <Field
                              label="Nome do responsável"
                              icon={<Shield size={16} color="#0052CC" />}
                            >
                              <input
                                value={form.nomeResponsavel}
                                disabled={!!responsavelCadastrado}
                                onChange={(e) =>
                                  updateField("nomeResponsavel", e.target.value)
                                }
                                placeholder="Digite o nome do responsável"
                                className="w-full"
                                style={inputStyle(
                                  !!fieldErrors.nomeResponsavel,
                                  !!responsavelCadastrado,
                                )}
                              />
                              {fieldErrors.nomeResponsavel && (
                                <FieldError message={fieldErrors.nomeResponsavel} />
                              )}
                            </Field>
                          </div>

                          <Field label="CPF" icon={<Shield size={16} color="#0052CC" />}>
                            <input
                              value={form.cpfResponsavel}
                              disabled={!!responsavelCadastrado}
                              onChange={(e) =>
                                updateField("cpfResponsavel", formatCPF(e.target.value))
                              }
                              placeholder="000.000.000-00"
                              className="w-full"
                              maxLength={14}
                              inputMode="numeric"
                              style={inputStyle(
                                !!fieldErrors.cpfResponsavel,
                                !!responsavelCadastrado,
                              )}
                            />
                            {fieldErrors.cpfResponsavel && (
                              <FieldError message={fieldErrors.cpfResponsavel} />
                            )}
                          </Field>

                          <Field label="Telefone" icon={<Phone size={16} color="#0052CC" />}>
                            <input
                              value={form.telefoneResponsavel}
                              disabled={!!responsavelCadastrado}
                              onChange={(e) =>
                                updateField(
                                  "telefoneResponsavel",
                                  formatPhone(e.target.value),
                                )
                              }
                              placeholder="(00) 00000-0000"
                              className="w-full"
                              maxLength={15}
                              inputMode="numeric"
                              style={inputStyle(
                                !!fieldErrors.telefoneResponsavel,
                                !!responsavelCadastrado,
                              )}
                            />
                            {fieldErrors.telefoneResponsavel && (
                              <FieldError message={fieldErrors.telefoneResponsavel} />
                            )}
                          </Field>

                          <div className="md:col-span-2">
                            <Field label="Email" icon={<Mail size={16} color="#0052CC" />}>
                              <input
                                value={form.emailResponsavel}
                                disabled={!!responsavelCadastrado}
                                onChange={(e) =>
                                  updateField(
                                    "emailResponsavel",
                                    e.target.value.toLowerCase(),
                                  )
                                }
                                placeholder="email@exemplo.com"
                                className="w-full"
                                type="email"
                                style={inputStyle(
                                  !!fieldErrors.emailResponsavel,
                                  !!responsavelCadastrado,
                                )}
                              />
                              {fieldErrors.emailResponsavel && (
                                <FieldError message={fieldErrors.emailResponsavel} />
                              )}
                            </Field>
                          </div>
                        </div>
                      </section>

                      <section
                        className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-8"
                        style={{
                          background: "#fff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                        }}
                      >
                        <h2
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#1A2B5F",
                            marginBottom: 20,
                          }}
                        >
                          Dados do paciente
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                          <div className="md:col-span-2">
                            <Field
                              label="Nome do paciente"
                              icon={<UserRound size={16} color="#0052CC" />}
                            >
                              <input
                                value={form.nomePaciente}
                                onChange={(e) =>
                                  updateField("nomePaciente", e.target.value)
                                }
                                placeholder="Digite o nome do paciente"
                                className="w-full"
                                style={inputStyle(!!fieldErrors.nomePaciente)}
                              />
                              {fieldErrors.nomePaciente && (
                                <FieldError message={fieldErrors.nomePaciente} />
                              )}
                            </Field>
                          </div>

                          <Field
                            label="Data de nascimento"
                            icon={<Calendar size={16} color="#0052CC" />}
                          >
                            <input
                              type="date"
                              value={form.dataNascimento}
                              onChange={(e) =>
                                updateField("dataNascimento", e.target.value)
                              }
                              className="w-full"
                              style={inputStyle(!!fieldErrors.dataNascimento)}
                            />
                            {fieldErrors.dataNascimento && (
                              <FieldError message={fieldErrors.dataNascimento} />
                            )}
                          </Field>

                          <Field label="Idade" icon={<Baby size={16} color="#0052CC" />}>
                            <div
                              style={{
                                ...inputStyle(false),
                                display: "flex",
                                alignItems: "center",
                                color: "#6B7A99",
                                fontWeight: 600,
                              }}
                            >
                              {idadePreview
                                ? `${idadePreview} anos`
                                : "Será calculada automaticamente"}
                            </div>
                          </Field>

                          <div className="md:col-span-2">
                            <Field
                              label="Observações clínicas"
                              icon={<FileText size={16} color="#0052CC" />}
                            >
                              <textarea
                                value={form.observacoes}
                                onChange={(e) =>
                                  updateField("observacoes", e.target.value)
                                }
                                rows={5}
                                placeholder="Digite observações importantes sobre o paciente"
                                className="w-full resize-none"
                                style={{
                                  ...inputStyle(false),
                                  height: "auto",
                                  minHeight: 132,
                                  paddingTop: 14,
                                }}
                              />
                            </Field>
                          </div>
                        </div>
                      </section>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full sm:w-auto rounded-2xl px-6 py-4 flex items-center justify-center gap-2"
                          style={{
                            background: "linear-gradient(135deg, #0A8F3D, #00A337)",
                            color: "#fff",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 15,
                            fontWeight: 700,
                            boxShadow: "0 12px 28px rgba(10,143,61,0.22)",
                            minWidth: 260,
                            maxWidth: "100%",
                            opacity: loading ? 0.75 : 1,
                          }}
                        >
                          <Save size={18} />
                          {loading
                            ? "Salvando..."
                            : responsavelCadastrado
                              ? "Adicionar paciente"
                              : "Cadastrar responsável e paciente"}
                        </button>
                      </div>
                    </div>

                    <aside className="min-w-0">
                      <div
                        className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 2xl:sticky 2xl:top-8"
                        style={{
                          background: "#fff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#1A2B5F",
                            marginBottom: 16,
                          }}
                        >
                          Pré-visualização
                        </h3>

                        <div
                          className="rounded-3xl p-5"
                          style={{
                            background: "linear-gradient(135deg, #0052CC, #0065FF)",
                            color: "#fff",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center"
                              style={{ background: "rgba(255,255,255,0.16)" }}
                            >
                              <span
                                style={{
                                  fontSize: 18,
                                  fontWeight: 700,
                                  color: "#fff",
                                }}
                              >
                                {iniciaisPaciente}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p style={{ fontSize: 12, opacity: 0.75 }}>
                                Paciente atual
                              </p>
                              <h4
                                style={{
                                  fontSize: 20,
                                  fontWeight: 700,
                                  marginTop: 4,
                                  wordBreak: "break-word",
                                }}
                              >
                                {form.nomePaciente.trim() || "Novo paciente"}
                              </h4>
                            </div>
                          </div>

                          <div className="mt-5 space-y-3">
                            <PreviewItem
                              label="Idade"
                              value={idadePreview ? `${idadePreview} anos` : "-"}
                            />
                            <PreviewItem
                              label="Responsável"
                              value={form.nomeResponsavel.trim() || "-"}
                            />
                            <PreviewItem
                              label="Telefone"
                              value={form.telefoneResponsavel || "-"}
                            />
                            <PreviewItem
                              label="Total cadastrado"
                              value={`${pacientesCadastrados} paciente(s)`}
                            />
                          </div>
                        </div>

                        <div className="mt-5">
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#1A2B5F",
                              marginBottom: 10,
                            }}
                          >
                            Observações clínicas
                          </p>

                          <div
                            className="rounded-2xl p-4"
                            style={{
                              background: "#F8FBFF",
                              border: "1.5px solid #E3EEFF",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 13,
                                color: "#4C5B7C",
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.6,
                                wordBreak: "break-word",
                              }}
                            >
                              {form.observacoes.trim() ||
                                "Nenhuma observação informada ainda."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>

        {showSuccessModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 20,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 460,
                background: "#fff",
                borderRadius: 28,
                border: "1.5px solid #DBEAFE",
                boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                padding: 28,
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={20} color="#6B7A99" />
              </button>

              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  background: "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <CheckCircle2 size={30} color="#0A8F3D" />
              </div>

              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#1A2B5F",
                  marginBottom: 8,
                }}
              >
                Paciente cadastrado
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: "#6B7A99",
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                Paciente cadastrado com sucesso para este responsável. Deseja
                adicionar outro paciente para o mesmo responsável?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleContinueRegistering}
                  style={{
                    minHeight: 48,
                    borderRadius: 16,
                    border: "1.5px solid #CFE0FF",
                    background: "#EEF4FF",
                    color: "#0052CC",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Adicionar outro
                </button>

                <button
                  onClick={handleFinishRegistering}
                  style={{
                    minHeight: 48,
                    borderRadius: 16,
                    border: "none",
                    background: "linear-gradient(135deg, #0A8F3D, #00A337)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Encerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileWrapper>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        className="mb-2 flex items-center gap-2"
        style={{ fontSize: 13, fontWeight: 600, color: "#1A2B5F" }}
      >
        {icon}
        <span className="min-w-0 break-words">{label}</span>
      </label>
      {children}
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      style={{
        marginTop: 8,
        fontSize: 12,
        color: "#DC2626",
        fontWeight: 500,
      }}
    >
      {message}
    </p>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: "rgba(255,255,255,0.12)" }}
    >
      <p style={{ fontSize: 11, opacity: 0.72 }}>{label}</p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          marginTop: 2,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
    </div>
  );
}
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import {
  ArrowLeft,
  Send,
  UserRound,
  BadgeCheck,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";

type FormData = {
  nome: string;
  cpf: string;
  crfa: string;
  telefone: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCPF(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function normalizeCrfa(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9/-]/g, "")
    .slice(0, 20);
}

export function CadastroFonoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    nome: "",
    cpf: "",
    crfa: "",
    telefone: "",
    email: "",
    senha: "",
    confirmacaoSenha: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isValid = useMemo(() => {
    const cpfDigits = onlyDigits(form.cpf);
    const phoneDigits = onlyDigits(form.telefone);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    const senhaOk = form.senha.length >= 6;
    const confirmacaoOk =
      form.senha === form.confirmacaoSenha && form.senha.length >= 6;

    return (
      form.nome.trim().length >= 3 &&
      cpfDigits.length === 11 &&
      form.crfa.trim().length >= 4 &&
      (phoneDigits.length === 10 || phoneDigits.length === 11) &&
      emailOk &&
      senhaOk &&
      confirmacaoOk
    );
  }, [form]);

  function validate(data: FormData) {
    const nextErrors: FormErrors = {};
    const cpfDigits = onlyDigits(data.cpf);
    const phoneDigits = onlyDigits(data.telefone);

    if (!data.nome.trim()) {
      nextErrors.nome = "Informe o nome do fonoaudiólogo.";
    } else if (data.nome.trim().length < 3) {
      nextErrors.nome = "O nome precisa ter pelo menos 3 caracteres.";
    }

    if (!cpfDigits) {
      nextErrors.cpf = "Informe o CPF.";
    } else if (cpfDigits.length !== 11) {
      nextErrors.cpf = "O CPF deve conter 11 dígitos.";
    }

    if (!data.crfa.trim()) {
      nextErrors.crfa = "Informe o CRFa.";
    } else if (data.crfa.trim().length < 4) {
      nextErrors.crfa = "Informe um CRFa válido.";
    }

    if (!phoneDigits) {
      nextErrors.telefone = "Informe o telefone.";
    } else if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      nextErrors.telefone = "O telefone deve ter 10 ou 11 dígitos.";
    }

    if (!data.email.trim()) {
      nextErrors.email = "Informe o e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (!data.senha) {
      nextErrors.senha = "Informe a senha.";
    } else if (data.senha.length < 6) {
      nextErrors.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (!data.confirmacaoSenha) {
      nextErrors.confirmacaoSenha = "Confirme a senha.";
    } else if (data.senha !== data.confirmacaoSenha) {
      nextErrors.confirmacaoSenha = "As senhas não coincidem.";
    }

    return nextErrors;
  }

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = validate(form);
    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setShowConfirmation(true);
      setForm({
        nome: "",
        cpf: "",
        crfa: "",
        telefone: "",
        email: "",
        senha: "",
        confirmacaoSenha: "",
      });
      setErrors({});
    }, 600);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "2px solid #DBEAFE",
    fontFamily: "'Poppins', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    color: "#1A2B5F",
    outline: "none",
    background: "#FAFCFF",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: "#1A2B5F",
    display: "block",
    marginBottom: 8,
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="min-h-screen"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background:
            "linear-gradient(180deg, #F7FAFF 0%, #EEF5FF 45%, #E8F1FF 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-16 -right-16 md:-top-28 md:-right-28 rounded-full opacity-20"
            style={{
              width: 220,
              height: 220,
              background: "#0052CC",
            }}
          />
          <div
            className="absolute top-28 -left-14 md:top-40 md:-left-20 rounded-full opacity-10"
            style={{
              width: 180,
              height: 180,
              background: "#0052CC",
            }}
          />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-10 py-6 md:py-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center rounded-2xl transition-all active:scale-95"
                style={{
                  width: 48,
                  height: 48,
                  background: "#ffffff",
                  border: "2px solid #DBEAFE",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0,82,204,0.08)",
                }}
              >
                <ArrowLeft size={22} color="#0052CC" />
              </button>

              <div
                className="px-4 py-2 rounded-2xl"
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #DBEAFE",
                  boxShadow: "0 4px 14px rgba(0,82,204,0.06)",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0052CC",
                    letterSpacing: 0.4,
                  }}
                >
                  CADASTRO DE FONOAUDIÓLOGO
                </p>
              </div>
            </div>

            {showConfirmation ? (
              <div className="max-w-2xl mx-auto">
                <div
                  className="rounded-[30px] p-6 sm:p-8 md:p-10 text-center"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #DBEAFE",
                    boxShadow: "0 12px 34px rgba(0,82,204,0.08)",
                  }}
                >
                  <div
                    className="w-24 h-24 rounded-[28px] flex items-center justify-center mx-auto mb-6"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,82,204,0.12), rgba(0,101,255,0.18))",
                    }}
                  >
                    <CheckCircle2 size={52} color="#0052CC" />
                  </div>

                  <h1
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      color: "#1A2B5F",
                      lineHeight: 1.1,
                      marginBottom: 12,
                    }}
                  >
                    Solicitação enviada com sucesso
                  </h1>

                  <p
                    style={{
                      fontSize: 15,
                      color: "#6B7A99",
                      lineHeight: 1.75,
                      maxWidth: 560,
                      margin: "0 auto 24px",
                    }}
                  >
                    Recebemos seus dados. Agora é só aguardar o envio de um
                    e-mail com as próximas instruções para continuar o processo
                    de cadastro.
                  </p>

                  <div
                    className="rounded-2xl px-4 py-4 mb-6 text-left"
                    style={{
                      background: "#F7FAFF",
                      border: "1px solid #E2ECFF",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "#4F5D7A",
                        lineHeight: 1.7,
                        fontWeight: 500,
                      }}
                    >
                      📩 Verifique sua caixa de entrada e, se necessário, também
                      a pasta de spam ou promoções.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowConfirmation(false)}
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl transition-all active:scale-95"
                      style={{
                        background: "#F4F7FF",
                        color: "#0052CC",
                        border: "2px solid #DBEAFE",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Enviar novo cadastro
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl transition-all active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #0052CC, #0065FF)",
                        color: "#fff",
                        border: "none",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 8px 20px rgba(0,82,204,0.22)",
                      }}
                    >
                      Voltar ao início
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6 md:gap-8 items-start">
                {/* Card lateral */}
                <div
                  className="rounded-[30px] p-6 md:p-7"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #DBEAFE",
                    boxShadow: "0 10px 30px rgba(0,82,204,0.08)",
                  }}
                >
                  <div
                    className="w-20 h-20 rounded-[26px] flex items-center justify-center mb-5"
                    style={{
                      background: "linear-gradient(135deg, #0052CC, #0065FF)",
                      boxShadow: "0 10px 24px rgba(0,82,204,0.25)",
                    }}
                  >
                    <UserRound size={38} color="#fff" />
                  </div>

                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#1A2B5F",
                      lineHeight: 1.1,
                      marginBottom: 10,
                    }}
                  >
                    Novo fono
                  </h1>

                  <p
                    style={{
                      fontSize: 14,
                      color: "#6B7A99",
                      lineHeight: 1.65,
                      marginBottom: 20,
                    }}
                  >
                    Preencha os dados do profissional para enviar a solicitação
                    de cadastro.
                  </p>

                  <div className="space-y-3">
                    {[
                      { icon: "👤", text: "Nome completo" },
                      { icon: "🪪", text: "CPF" },
                      { icon: "📄", text: "CRFa" },
                      { icon: "📞", text: "Telefone" },
                      { icon: "✉️", text: "E-mail" },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3"
                        style={{
                          background: "#F7FAFF",
                          border: "1px solid #E2ECFF",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center"
                          style={{ background: "#EBF3FF" }}
                        >
                          <span style={{ fontSize: 18 }}>{item.icon}</span>
                        </div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1A2B5F",
                          }}
                        >
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulário */}
                <div
                  className="rounded-[30px] p-5 sm:p-6 md:p-8"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #DBEAFE",
                    boxShadow: "0 10px 30px rgba(0,82,204,0.08)",
                  }}
                >
                  <div className="mb-6">
                    <h2
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: "#1A2B5F",
                        marginBottom: 6,
                      }}
                    >
                      Dados do profissional
                    </h2>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#6B7A99",
                        lineHeight: 1.6,
                      }}
                    >
                      Preencha o formulário abaixo para enviar sua solicitação.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div className="md:col-span-2">
                        <label style={labelStyle}>Nome</label>
                        <input
                          type="text"
                          placeholder="Digite o nome completo"
                          value={form.nome}
                          onChange={(e) => updateField("nome", e.target.value)}
                          style={inputStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#0052CC";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 4px rgba(0,82,204,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#DBEAFE";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        {errors.nome && (
                          <p
                            className="mt-2 text-sm"
                            style={{ color: "#D14343" }}
                          >
                            {errors.nome}
                          </p>
                        )}
                      </div>

                      <div>
                        <label style={labelStyle}>CPF</label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          value={form.cpf}
                          onChange={(e) =>
                            updateField("cpf", maskCPF(e.target.value))
                          }
                          style={inputStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#0052CC";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 4px rgba(0,82,204,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#DBEAFE";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        {errors.cpf && (
                          <p
                            className="mt-2 text-sm"
                            style={{ color: "#D14343" }}
                          >
                            {errors.cpf}
                          </p>
                        )}
                      </div>

                      <div>
                        <label style={labelStyle}>CRFa</label>
                        <input
                          type="text"
                          placeholder="Ex.: 12345-PE"
                          value={form.crfa}
                          onChange={(e) =>
                            updateField("crfa", normalizeCrfa(e.target.value))
                          }
                          style={inputStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#0052CC";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 4px rgba(0,82,204,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#DBEAFE";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        {errors.crfa && (
                          <p
                            className="mt-2 text-sm"
                            style={{ color: "#D14343" }}
                          >
                            {errors.crfa}
                          </p>
                        )}
                      </div>

                      <div>
                        <label style={labelStyle}>Telefone</label>
                        <input
                          type="text"
                          placeholder="(00) 00000-0000"
                          value={form.telefone}
                          onChange={(e) =>
                            updateField("telefone", maskPhone(e.target.value))
                          }
                          style={inputStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#0052CC";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 4px rgba(0,82,204,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#DBEAFE";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        {errors.telefone && (
                          <p
                            className="mt-2 text-sm"
                            style={{ color: "#D14343" }}
                          >
                            {errors.telefone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label style={labelStyle}>E-mail</label>
                        <input
                          type="email"
                          placeholder="fono@clinica.com"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          style={inputStyle}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#0052CC";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 4px rgba(0,82,204,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#DBEAFE";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        {errors.email && (
                          <p
                            className="mt-2 text-sm"
                            style={{ color: "#D14343" }}
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label style={labelStyle}>Senha</label>
                        <input
                          type="password"
                          placeholder="********"
                          value={form.senha}
                          onChange={(e) => updateField("senha", e.target.value)}
                          style={inputStyle}
                          autoComplete="new-password"
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#0052CC";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 4px rgba(0,82,204,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#DBEAFE";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        {errors.senha && (
                          <p
                            className="mt-2 text-sm"
                            style={{ color: "#D14343" }}
                          >
                            {errors.senha}
                          </p>
                        )}
                      </div>

                      <div>
                        <label style={labelStyle}>Confirmação de Senha</label>
                        <input
                          type="password"
                          placeholder="********"
                          value={form.confirmacaoSenha}
                          onChange={(e) =>
                            updateField("confirmacaoSenha", e.target.value)
                          }
                          style={inputStyle}
                          autoComplete="new-password"
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#0052CC";
                            e.currentTarget.style.boxShadow =
                              "0 0 0 4px rgba(0,82,204,0.08)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#DBEAFE";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        {errors.confirmacaoSenha && (
                          <p
                            className="mt-2 text-sm"
                            style={{ color: "#D14343" }}
                          >
                            {errors.confirmacaoSenha}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className="rounded-2xl px-4 py-4 flex items-start gap-3"
                      style={{
                        background: "#F7FAFF",
                        border: "1px solid #E2ECFF",
                      }}
                    >
                      <BadgeCheck
                        size={20}
                        color="#0052CC"
                        style={{ marginTop: 2, flexShrink: 0 }}
                      />
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6B7A99",
                          lineHeight: 1.6,
                        }}
                      >
                        Revise os dados antes de enviar. Após o envio, você
                        receberá um e-mail com as próximas orientações.
                      </p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-6 py-4 rounded-2xl transition-all active:scale-95"
                        style={{
                          background: "#F4F7FF",
                          color: "#6B7A99",
                          border: "2px solid #DBEAFE",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={submitted}
                        className="w-full sm:w-auto px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                        style={{
                          background: isValid
                            ? "linear-gradient(135deg, #0052CC, #0065FF)"
                            : "linear-gradient(135deg, #7EA8E8, #8DB4F0)",
                          color: "#fff",
                          border: "none",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: isValid
                            ? "0 8px 20px rgba(0,82,204,0.28)"
                            : "none",
                          opacity: submitted ? 0.85 : 1,
                        }}
                      >
                        <Send size={18} />
                        {submitted ? "Enviando..." : "Enviar cadastro"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {!showConfirmation && (
              <div className="xl:hidden mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    icon: <UserRound size={18} color="#0052CC" />,
                    label: "Nome",
                  },
                  {
                    icon: <BadgeCheck size={18} color="#0052CC" />,
                    label: "CRFa",
                  },
                  {
                    icon: <Phone size={18} color="#0052CC" />,
                    label: "Telefone",
                  },
                  { icon: <Mail size={18} color="#0052CC" />, label: "E-mail" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl px-4 py-4 flex items-center gap-3"
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 8px 18px rgba(0,82,204,0.05)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: "#EBF3FF" }}
                    >
                      {item.icon}
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#1A2B5F",
                      }}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}

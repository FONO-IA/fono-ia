import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { ArrowLeft, User, Phone, Save } from "lucide-react";

export function AddPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    age: "",
    observations: "",
    parentName: "",
    phone: "",
    email: "",
    cpf: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    alert(
      "Paciente adicionado com sucesso! Código de acesso: FN" +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")
    );
    navigate("/admin");
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
        {/* Desktop Sidebar - Info */}
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

            {/* Info cards */}
            <div className="space-y-3">
              {[
                {
                  icon: "🎯",
                  title: "Código Automático",
                  desc: "Gerado após cadastro",
                },
                {
                  icon: "🔐",
                  title: "PIN Seguro",
                  desc: "4 dígitos escolhidos",
                },
                {
                  icon: "📊",
                  title: "Perfil Completo",
                  desc: "Histórico e evolução",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                  </div>
                  <div>
                    <p
                      style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 400,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop Content */}
          <div className="hidden md:flex md:flex-col md:flex-1 min-h-0">
            {/* Desktop Header */}
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

            {/* Form Desktop */}
            <div className="flex-1 min-h-0 overflow-y-auto px-8 lg:px-12 py-8">
              <div className="max-w-4xl pb-8">
                {/* Dados Pessoais */}
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
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#000073",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        Nome Completo*
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Ex: Maria Silva Santos"
                        className="w-full px-4 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
                          fontFamily: "'Poppins', sans-serif",
                        }}
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
                        Data de Nascimento*
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) =>
                          handleChange("birthDate", e.target.value)
                        }
                        className="w-full px-4 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
                          fontFamily: "'Poppins', sans-serif",
                        }}
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
                        Idade*
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleChange("age", e.target.value)}
                        placeholder="Ex: 7"
                        className="w-full px-4 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
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
                        onChange={(e) =>
                          handleChange("observations", e.target.value)
                        }
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

                {/* Contato do Responsável */}
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
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#000073",
                          marginBottom: 8,
                          display: "block",
                        }}
                      >
                        Nome do Responsável*
                      </label>
                      <input
                        type="text"
                        value={formData.parentName}
                        onChange={(e) =>
                          handleChange("parentName", e.target.value)
                        }
                        placeholder="Ex: João Silva Santos"
                        className="w-full px-4 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
                          fontFamily: "'Poppins', sans-serif",
                        }}
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
                        Telefone*
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full px-4 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
                          fontFamily: "'Poppins', sans-serif",
                        }}
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
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full px-4 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
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
                        CPF do Responsável
                      </label>
                      <input
                        type="text"
                        value={formData.cpf}
                        onChange={(e) =>
                          handleChange("cpf", e.target.value)
                        }
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-3 rounded-2xl"
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

                {/* Actions */}
                <div className="flex gap-3">
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
                      background:"#007200",
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

          {/* Mobile Version */}
          <div
            className="md:hidden flex flex-col flex-1 min-h-screen"
            style={{ background: "#F4F7FF" }}
          >
            {/* Mobile Header */}
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

            {/* Form Mobile */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 pb-10">
              {/* Dados Pessoais */}
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
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#000073",
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      Nome Completo*
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Ex: Maria Silva Santos"
                      className="w-full px-4 py-3 rounded-2xl"
                      style={{
                        border: "1.5px solid #DBEAFE",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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
                        Nascimento*
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) =>
                          handleChange("birthDate", e.target.value)
                        }
                        className="w-full px-3 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 13,
                          outline: "none",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      />
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
                        Idade*
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleChange("age", e.target.value)}
                        placeholder="Ex: 7"
                        className="w-full px-3 py-3 rounded-2xl"
                        style={{
                          border: "1.5px solid #DBEAFE",
                          fontSize: 14,
                          outline: "none",
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
                      onChange={(e) =>
                        handleChange("observations", e.target.value)
                      }
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

              {/* Responsável */}
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
                      Nome do Responsável*
                    </label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) =>
                        handleChange("parentName", e.target.value)
                      }
                      placeholder="Ex: João Silva Santos"
                      className="w-full px-4 py-3 rounded-2xl"
                      style={{
                        border: "1.5px solid #DBEAFE",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    />
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
                      Telefone*
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-3 rounded-2xl"
                      style={{
                        border: "1.5px solid #DBEAFE",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    />
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
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="email@exemplo.com"
                      className="w-full px-4 py-3 rounded-2xl"
                      style={{
                        border: "1.5px solid #DBEAFE",
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    />
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
                      CPF do Responsável
                    </label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) =>
                        handleChange("cpf", e.target.value)
                      }
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 rounded-2xl"
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

              {/* Actions */}
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
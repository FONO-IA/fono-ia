import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { api } from "../services/api";
import {
  ArrowLeft,
  Dumbbell,
  Target,
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
  Wand2,
  X,
} from "lucide-react";

type Level = "Fácil" | "Médio" | "Dificíl";

type ContentItem = {
  id: number;
  texto: string;
  instrucao: string;
};

export function AddExercise() {
  const navigate = useNavigate();
  const [newCategory, setNewCategory] = useState("");
  const [showAiBox, setShowAiBox] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [instrucaoItem, setInstrucaoItem] = useState("");
  const [form, setForm] = useState({
    nome: "",
    objetivo: "",
    nivel: "Médio" as Level,
    instrucoesGuia: `Guia de texto para cada palavra:
- Diga a palavra
- Repita devagar
- Use a dica visual quando necessário`,
    ativo: true,
  });

  const [conteudos, setConteudos] = useState<ContentItem[]>([]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const totalConteudos = conteudos.length;
  const location = useLocation();
  const pacienteId = location.state?.pacienteId;

  const previewConteudo = useMemo(() => {
    return conteudos.map((item) => item.texto).join(", ");
  }, [conteudos]);

  const handleSave = async () => {
  const nivelMap = {
    "Fácil": "FAC",
    "Médio": "MED",
    "Dificíl": "DIF",
  };

  if (!pacienteId) {
    alert("Paciente não identificado. Volte ao paciente e clique em Criar Exercício novamente.");
    return;
  }

  const payload = {
    categoria: newCategory.trim(),
    nivel: nivelMap[form.nivel],
    objetivo: form.objetivo.trim(),
    instrucao: instrucaoItem.trim(),
    conteudo: conteudo.trim(),
    paciente: [pacienteId],
    conteudos: [
      {
        texto: conteudo.trim(),
        instrucao: instrucaoItem.trim(),
      },
    ],
  };

  try {
    await api.post("/exercicios/", payload);

    setNewCategory("");
    setConteudo("");
    setInstrucaoItem("");
    setConteudos([]);
    setForm({
      nome: "",
      objetivo: "",
      nivel: "Médio",
      instrucoesGuia: `Guia de texto para cada palavra:
- Diga a palavra
- Repita devagar
- Use a dica visual quando necessário`,
      ativo: true,
    });

    alert("Exercício salvo com sucesso!");
  } catch (e) {
    console.error("Erro ao salvar exercício:", e);
    alert(e instanceof Error ? e.message : "Erro ao salvar exercício.");
  }
};

  const handleGenerateWithAI = () => {
    const prompt = aiPrompt.trim();

    if (!prompt) return;

    const generatedItems: ContentItem[] = [
      {
        id: Date.now(),
        texto: "A",
        instrucao: `Diga a vogal!

A

💡 Como em ABACATE`,
      },
      {
        id: Date.now() + 1,
        texto: "E",
        instrucao: `Diga a vogal!

E

💡 Como em ELEFANTE`,
      },
      {
        id: Date.now() + 2,
        texto: "I",
        instrucao: `Diga a vogal!

I

💡 Como em IGREJA`,
      },
    ];

    setForm((prev) => ({
      ...prev,
      nome: prev.nome || "Exercício gerado com IA",
      categoria: "Fonemas",
      objetivo:
        prev.objetivo || `Exercício montado com base na solicitação: ${prompt}`,
      nivel: prev.nivel || "Médio",
      instrucoesGuia: `Guia de texto para cada palavra:
- Leia a palavra para a criança
- Peça para repetir com clareza
- Use a dica visual abaixo de cada item
- Faça reforço positivo após cada acerto`,
    }));

    setConteudos(generatedItems);
    setShowAiBox(false);
    setAiPrompt("");
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="min-h-screen"
        style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
      >
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="xl:grid xl:min-h-screen xl:grid-cols-[340px_minmax(0,1fr)]">
            {/* Sidebar desktop grande */}
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
                  <span
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}
                  >
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
                    <Dumbbell size={28} color="#fff" />
                  </div>

                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.15,
                    }}
                  >
                    Novo Exercício
                  </h1>

                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.78)",
                      marginTop: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    Monte um exercício com conteúdo por item e instrução
                    individual para cada palavra.
                  </p>

                  <div className="mt-8 space-y-3">
                    {[
                      { label: "Categoria", value: newCategory || "-" },
                      { label: "Nível", value: form.nivel },
                      { label: "Itens", value: `${totalConteudos}` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl p-4"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#fff",
                            marginTop: 2,
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

            {/* Conteúdo principal */}
            <main className="min-w-0">
              {/* Header mobile/tablet */}
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
                  <span
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}
                  >
                    Voltar
                  </span>
                </button>

                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                  >
                    <Dumbbell size={24} color="#fff" />
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
                      Adicionar Exercício
                    </h1>
                    <p
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.75)",
                        marginTop: 6,
                        lineHeight: 1.5,
                      }}
                    >
                      Conteúdo por item com instrução individual
                    </p>
                  </div>
                </div>

                {/* Resumo tablet */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Categoria", value: newCategory || "-" },
                    { label: "Nível", value: form.nivel },
                    { label: "Itens", value: `${totalConteudos}` },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl p-4"
                      style={{ background: "rgba(255,255,255,0.12)" }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.72)",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#fff",
                          marginTop: 2,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-12 pb-8 xl:py-10">
                <div className="mx-auto max-w-7xl">
                  {/* Cabeçalho desktop/tablet */}
                  <div className="hidden xl:flex items-center justify-between mb-8 gap-6">
                    <div className="min-w-0">
                      <h2
                        style={{
                          fontSize: 30,
                          fontWeight: 700,
                          color: "#1A2B5F",
                        }}
                      >
                        Cadastrar Exercício
                      </h2>
                      <p
                        style={{
                          fontSize: 15,
                          color: "#6B7A99",
                          marginTop: 8,
                        }}
                      >
                        Preencha os dados ou use a IA para montar tudo
                        automaticamente
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAiBox((prev) => !prev)}
                      className="shrink-0 rounded-2xl px-5 py-4 flex items-center gap-2 transition-all hover:opacity-90"
                      style={{
                        background: "#EEF4FF",
                        color: "#0052CC",
                        border: "1.5px solid #CFE0FF",
                        cursor: "pointer",
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      <Wand2 size={18} />
                      Ajuda da IA
                    </button>
                  </div>

                  {/* Ação tablet/mobile */}
                  <div className="xl:hidden -mt-4 sm:-mt-6 md:-mt-8 mb-4 sm:mb-5 py-4">
                    <button
                      onClick={() => setShowAiBox((prev) => !prev)}
                      className="w-full sm:w-auto rounded-2xl px-5 py-4 flex items-center justify-center gap-2"
                      style={{
                        background: "#EEF4FF",
                        color: "#0052CC",
                        border: "1.5px solid #CFE0FF",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      <Wand2 size={18} />
                      Ajuda da IA
                    </button>
                  </div>

                  {showAiBox && (
                    <section
                      className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 mb-5 sm:mb-6"
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #DBEAFE",
                        boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                      }}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#1A2B5F",
                            }}
                          >
                            Como o exercício deve ser feito?
                          </h3>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#6B7A99",
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            Escreva para a IA como o fono quer montar o
                            exercício
                          </p>
                        </div>

                        <button
                          onClick={() => setShowAiBox(false)}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          <X size={18} color="#7B8AAC" />
                        </button>
                      </div>

                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={4}
                        placeholder="Ex: Criar um exercício com vogais, nível fácil, com palavras curtas e dica visual para cada item."
                        className="w-full resize-none"
                        style={{
                          ...inputStyle,
                          height: "auto",
                          paddingTop: 14,
                        }}
                      />

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={handleGenerateWithAI}
                          className="w-full sm:w-auto rounded-2xl px-5 py-3 flex items-center justify-center gap-2"
                          style={{
                            background: "#0052CC",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          <Wand2 size={16} />
                          Gerar exercício
                        </button>
                      </div>
                    </section>
                  )}

                  {/* Layout principal responsivo */}
                  <div className="grid grid-cols-1 gap-5 lg:gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Coluna principal */}
                    <div className="min-w-0 space-y-5 lg:space-y-6">
                      <section
                        className="rounded-[24px] sm:rounded-[28px] p-4 sm:p-6 lg:p-8"
                        style={{
                          background: "#fff",
                          border: "1.5px solid #DBEAFE",
                          boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                          <Field
                            label="Categoria"
                            icon={<Sparkles size={16} color="#0052CC" />}
                          >
                            <div className="space-y-3">
                              <input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Digite a nova categoria"
                                className="w-full"
                                style={inputStyle}
                              />
                            </div>
                          </Field>

                          <Field
                            label="Nível"
                            icon={<CheckCircle2 size={16} color="#0052CC" />}
                          >
                            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2">
                              {(["Fácil", "Médio", "Dificíl"] as Level[]).map(
                                (nivel) => {
                                  const isActive = form.nivel === nivel;
                                  return (
                                    <button
                                      key={nivel}
                                      type="button"
                                      onClick={() =>
                                        updateField("nivel", nivel)
                                      }
                                      className="min-h-[48px] rounded-2xl px-3 py-3 transition-all"
                                      style={{
                                        border: isActive
                                          ? "2px solid #0052CC"
                                          : "1.5px solid #DBEAFE",
                                        background: isActive
                                          ? "#EBF3FF"
                                          : "#F8FBFF",
                                        color: isActive ? "#0052CC" : "#6B7A99",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {nivel}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          </Field>

                          <div className="md:col-span-2">
                            <Field
                              label="Objetivo"
                              icon={<Target size={16} color="#0052CC" />}
                            >
                              <input
                                value={form.objetivo}
                                onChange={(e) =>
                                  updateField("objetivo", e.target.value)
                                }
                                placeholder="Ex: Trabalhar identificação e emissão correta"
                                className="w-full"
                                style={inputStyle}
                              />
                            </Field>
                          </div>

                          <div className="md:col-span-2">
                            <Field
                              label="Instruções"
                              icon={<FileText size={16} color="#0052CC" />}
                            >
                              <textarea
                                rows={5}
                                placeholder="Guia de texto para cada palavra"
                                className="w-full resize-none"
                                style={{
                                  ...inputStyle,
                                  height: "auto",
                                  minHeight: 132,
                                  paddingTop: 14,
                                }}
                              />
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
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div className="min-w-0 w-full">
                            <h3
                              style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#1A2B5F",
                              }}
                            >
                              Conteúdo do exercício
                            </h3>
                            <input
                              value={conteudo}
                              onChange={(e) => setConteudo(e.target.value)}
                              placeholder="Digite a nova palavra, sílaba ou conteúdo"
                              className="w-full"
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <textarea
                            value={instrucaoItem}
                            onChange={(e) => setInstrucaoItem(e.target.value)}
                            rows={6}
                            placeholder="Instrução específica deste conteúdo"
                            className="w-full resize-none"
                            style={{
                              ...inputStyle,
                              height: "auto",
                              minHeight: 160,
                              paddingTop: 14,
                            }}
                          />
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={handleSave}
                            className="w-full sm:w-auto rounded-2xl px-6 py-4 flex items-center justify-center gap-2"
                            style={{
                              background: "#007200",
                              color: "#fff",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 15,
                              fontWeight: 700,
                              boxShadow: "0 12px 28px rgba(54,179,126,0.22)",
                              minWidth: 220,
                              maxWidth: "100%",
                            }}
                          >
                            <Save size={18} />
                            Salvar Exercício
                          </button>
                        </div>
                      </section>
                    </div>

                    {/* Preview */}
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
                            background:
                              "linear-gradient(135deg, #0052CC, #0065FF)",
                            color: "#fff",
                          }}
                        >
                          <p style={{ fontSize: 12, opacity: 0.75 }}>Nome</p>
                          <h4
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              marginTop: 4,
                              wordBreak: "break-word",
                            }}
                          >
                            {form.nome || "Novo exercício"}
                          </h4>

                          <div className="mt-5 space-y-3">
                            <PreviewItem
                              label="Categoria"
                              value={newCategory || "-"}
                            />
                            <PreviewItem
                              label="Objetivo"
                              value={form.objetivo || "-"}
                            />
                            <PreviewItem label="Nível" value={form.nivel} />
                            <PreviewItem
                              label="Itens"
                              value={`${totalConteudos}`}
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
                            Resumo do conteúdo
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
                              {previewConteudo ||
                                "Nenhum conteúdo informado ainda."}
                            </p>
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
                            Guia de instruções
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
                                lineHeight: 1.7,
                                wordBreak: "break-word",
                              }}
                            >
                              {form.instrucoesGuia}
                            </p>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  borderRadius: 16,
  border: "1.5px solid #DBEAFE",
  background: "#F8FBFF",
  padding: "0 16px",
  fontFamily: "'Poppins', sans-serif",
  fontSize: 14,
  color: "#1A2B5F",
  outline: "none",
};

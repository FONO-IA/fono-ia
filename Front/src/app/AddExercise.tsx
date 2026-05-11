import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import { criarExercicio, gerarSugestaoExercicio } from "../services/exercicios";
import {
  ArrowLeft,
  Dumbbell,
  Target,
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Wand2,
  Plus,
  X,
} from "lucide-react";

type Level = "Fácil" | "Médio" | "Difícil";

type AddExerciseLocationState = {
  pacienteId?: string | number;
  patientId?: string | number;
  paciente?: {
    id?: string | number;
  };
};

const LEVEL_OPTIONS: Level[] = ["Fácil", "Médio", "Difícil"];

const NIVEL_TO_API: Record<Level, string> = {
  Fácil: "FAC",
  Médio: "MED",
  Difícil: "DIF",
};

type ContentItem = {
  id: number;
  texto: string;
  instrucao: string;
  dicaVisual?: File | null;
  dicaVisualPreview?: string;
};

export function AddExercise() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [newCategory, setNewCategory] = useState("");
  const [showAiBox, setShowAiBox] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiError, setAiError] = useState("");
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copiar sugestão");
  const [conteudo, setConteudo] = useState("");
  const [instrucaoItem, setInstrucaoItem] = useState("");
  const [dicaVisualFile, setDicaVisualFile] = useState<File | null>(null);
  const [dicaVisualPreview, setDicaVisualPreview] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
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

  const pacienteId = useMemo(() => {
    const state = location.state as AddExerciseLocationState | null;
    const idFromState =
      state?.pacienteId ?? state?.patientId ?? state?.paciente?.id;
    const idFromUrl =
      searchParams.get("pacienteId") ?? searchParams.get("paciente");
    const id = idFromState ?? idFromUrl;

    return id ? String(id) : "";
  }, [location.state, searchParams]);

  const getConteudosForPayload = () => {
    const items = [...conteudos];
    const textoAtual = conteudo.trim();

    if (textoAtual) {
      items.push({
        id: Date.now(),
        texto: textoAtual,
        instrucao:
          instrucaoItem.trim() ||
          form.instrucoesGuia.trim() ||
          `Pratique: ${textoAtual}`,
        dicaVisual: dicaVisualFile,
        dicaVisualPreview,
      });
    }

    return items
      .map((item) => ({
        texto: item.texto.trim(),
        instrucao:
          item.instrucao.trim() ||
          form.instrucoesGuia.trim() ||
          `Pratique: ${item.texto.trim()}`,
        dicaVisual: item.dicaVisual || null,
        dicaVisualPreview: item.dicaVisualPreview || "",
      }))
      .filter((item) => item.texto);
  };

  const conteudosPreview = useMemo(
    () => getConteudosForPayload(),
    [
      conteudos,
      conteudo,
      instrucaoItem,
      dicaVisualFile,
      dicaVisualPreview,
      form.instrucoesGuia,
    ],
  );
  const totalConteudos = conteudosPreview.length;

  const previewConteudo = useMemo(() => {
    return conteudosPreview.map((item) => item.texto).join(", ");
  }, [conteudosPreview]);

  const clearCurrentVisualTip = () => {
    if (dicaVisualPreview) {
      URL.revokeObjectURL(dicaVisualPreview);
    }

    setDicaVisualFile(null);
    setDicaVisualPreview("");
  };

  const handleVisualTipChange = (file?: File) => {
    if (dicaVisualPreview) {
      URL.revokeObjectURL(dicaVisualPreview);
    }

    if (!file) {
      setDicaVisualFile(null);
      setDicaVisualPreview("");
      return;
    }

    setDicaVisualFile(file);
    setDicaVisualPreview(URL.createObjectURL(file));
  };

  const revokeConteudoPreview = (item: ContentItem) => {
    if (item.dicaVisualPreview) {
      URL.revokeObjectURL(item.dicaVisualPreview);
    }
  };

  const clearAllVisualTips = () => {
    conteudos.forEach(revokeConteudoPreview);
    clearCurrentVisualTip();
  };

  const handleAddWord = () => {
    const texto = conteudo.trim();

    if (!texto) {
      setShowErrorModal(true);
      return;
    }

    setConteudos((prev) => [
      ...prev,
      {
        id: Date.now(),
        texto,
        instrucao:
          instrucaoItem.trim() ||
          form.instrucoesGuia.trim() ||
          `Pratique: ${texto}`,
        dicaVisual: dicaVisualFile,
        dicaVisualPreview,
      },
    ]);
    setConteudo("");
    setInstrucaoItem("");
    setDicaVisualFile(null);
    setDicaVisualPreview("");
  };

  const handleRemoveWord = (id: number) => {
    setConteudos((prev) =>
      prev.filter((item) => {
        const shouldKeep = item.id !== id;

        if (!shouldKeep) {
          revokeConteudoPreview(item);
        }

        return shouldKeep;
      }),
    );
  };

  const handleSave = async () => {
    if (!pacienteId) {
      alert(
        "Paciente não identificado. Volte ao paciente e clique em Criar Exercício novamente.",
      );
      return;
    }

    const conteudosValidos = getConteudosForPayload();
    const palavras = conteudosValidos.map((item) => item.texto);

    if (!newCategory.trim() || !form.objetivo.trim() || palavras.length === 0) {
      setShowErrorModal(true);
      return;
    }

    const payload = {
      nome:
        form.nome.trim() ||
        `Exercício de pronúncia - ${newCategory.trim()}`,
      categoria: newCategory.trim(),
      nivel: NIVEL_TO_API[form.nivel],
      objetivo: form.objetivo.trim(),
      instrucao:
        conteudosValidos[0]?.instrucao ||
        form.instrucoesGuia.trim() ||
        "Pratique o conteudo do exercicio.",
      conteudo: palavras.join(", "),
      paciente: [pacienteId],
      palavras,
      conteudos: conteudosValidos,
    };

    try {
      await criarExercicio(payload);

      clearAllVisualTips();
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

      setShowSuccessModal(true);
    } catch (e) {
      console.error("Erro ao salvar exercício:", e);
      alert(e instanceof Error ? e.message : "Erro ao salvar exercício.");
    }
  };

  const handleGenerateWithAI = async () => {
    const categoria = newCategory.trim();

    setShowAiBox(true);
    setAiError("");
    setCopyLabel("Copiar sugestão");

    if (!categoria) {
      setAiSuggestion("");
      setAiError("Informe uma categoria antes de pedir ajuda da IA.");
      return;
    }

    setIsGeneratingSuggestion(true);

    try {
      const response = await gerarSugestaoExercicio({
        categoria,
        nivel: form.nivel,
        objetivo: form.objetivo.trim(),
      });
      setAiSuggestion(response.sugestao);
    } catch (error) {
      console.error("Erro ao gerar sugestão da IA:", error);
      setAiSuggestion("");
      setAiError(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a sugestão agora.",
      );
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const handleCopySuggestion = async () => {
    if (!aiSuggestion) return;

    try {
      await navigator.clipboard.writeText(aiSuggestion);
      setCopyLabel("Sugestão copiada");
      window.setTimeout(() => setCopyLabel("Copiar sugestão"), 1800);
    } catch (error) {
      console.error("Erro ao copiar sugestão:", error);
      setCopyLabel("Não foi possível copiar");
      window.setTimeout(() => setCopyLabel("Copiar sugestão"), 1800);
    }
  };

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl text-center">
            <h2 className="text-lg font-bold text-[#1A2B5F] mb-2">
              Exercício Cadastrado!
            </h2>
            <p className="text-sm text-gray-600 mb-4">Salvo com sucesso!</p>

            <button
              onClick={() => {
                setShowSuccessModal(false);
              }}
              className="px-4 py-2 rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg, #0052CC, #0065FF)",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
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
              border: "1.5px solid #FECACA",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              padding: 28,
              position: "relative",
            }}
          >
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#1A2B5F",
                marginBottom: 8,
              }}
            >
              Campos obrigatórios
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6B7A99",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              Preencha todos os campos obrigatórios antes de salvar o exercício.
            </p>

            <div className="grid grid-cols-1  justify-items-center">
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  padding: "0 24px",
                  minHeight: 42,
                  borderRadius: 16,
                  border: "none",
                  background: "#EF4444",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                OK!
              </button>
            </div>
          </div>
        </div>
      )}
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
                        Preencha manualmente e use a IA apenas como apoio
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateWithAI}
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
                      onClick={handleGenerateWithAI}
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
                            Sugestão da IA
                          </h3>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#6B7A99",
                              marginTop: 6,
                              lineHeight: 1.5,
                            }}
                          >
                            Texto de apoio para o fonoaudiólogo consultar sem
                            alterar o formulário.
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

                      <div
                        className="rounded-2xl p-4"
                        style={{
                          background: "#F8FBFF",
                          border: "1.5px solid #DBEAFE",
                          minHeight: 180,
                          whiteSpace: "pre-wrap",
                          color: "#1A2B5F",
                          fontSize: 14,
                          lineHeight: 1.7,
                        }}
                      >
                        {isGeneratingSuggestion
                          ? "Gerando sugestão..."
                          : aiError || aiSuggestion || "Informe uma categoria e clique em Ajuda da IA."}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                          onClick={handleCopySuggestion}
                          disabled={!aiSuggestion || isGeneratingSuggestion}
                          className="w-full sm:w-auto rounded-2xl px-5 py-3 flex items-center justify-center gap-2"
                          style={{
                            background: "#EBF3FF",
                            color: "#0052CC",
                            border: "1.5px solid #93C5FD",
                            cursor:
                              !aiSuggestion || isGeneratingSuggestion
                                ? "not-allowed"
                                : "pointer",
                            fontSize: 14,
                            fontWeight: 700,
                            opacity: !aiSuggestion || isGeneratingSuggestion ? 0.65 : 1,
                          }}
                        >
                          {copyLabel}
                        </button>

                        <button
                          onClick={handleGenerateWithAI}
                          disabled={isGeneratingSuggestion}
                          className="w-full sm:w-auto rounded-2xl px-5 py-3 flex items-center justify-center gap-2"
                          style={{
                            background: "#0052CC",
                            color: "#fff",
                            border: "none",
                            cursor: isGeneratingSuggestion ? "not-allowed" : "pointer",
                            fontSize: 14,
                            fontWeight: 700,
                            opacity: isGeneratingSuggestion ? 0.7 : 1,
                          }}
                        >
                          <Wand2 size={16} />
                          Gerar novamente
                        </button>

                        <button
                          onClick={() => setShowAiBox(false)}
                          className="w-full sm:w-auto rounded-2xl px-5 py-3"
                          style={{
                            background: "#F8FBFF",
                            color: "#6B7A99",
                            border: "1.5px solid #DBEAFE",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          Fechar
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
                              {LEVEL_OPTIONS.map(
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
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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

                          <button
                            onClick={handleAddWord}
                            className="w-full lg:w-auto rounded-2xl px-6 py-4 flex items-center justify-center gap-2"
                            style={{
                              background: "#EBF3FF",
                              color: "#0052CC",
                              border: "1.5px solid #93C5FD",
                              cursor: "pointer",
                              fontSize: 15,
                              fontWeight: 800,
                              minWidth: 220,
                              maxWidth: "100%",
                            }}
                          >
                            <Plus size={18} />
                            Adicionar Palavra
                          </button>
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
                              value={instrucaoItem}
                              onChange={(e) => setInstrucaoItem(e.target.value)}
                              style={{
                                ...inputStyle,
                                height: "auto",
                                minHeight: 132,
                                paddingTop: 14,
                              }}
                            />
                          </Field>
                        </div>
                        <div className="mt-5 md:col-span-2">
                          <Field
                            label="Dica visual"
                            icon={<ImageIcon size={16} color="#0052CC" />}
                          >
                            <div
                              className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
                              style={{
                                background: "#F8FBFF",
                                border: "1.5px dashed #93C5FD",
                              }}
                            >
                              <div className="min-w-0">
                                <p
                                  style={{
                                    color: "#1A2B5F",
                                    fontSize: 14,
                                    fontWeight: 800,
                                  }}
                                >
                                  Imagem de apoio para esta palavra
                                </p>
                                <p
                                  style={{
                                    color: "#6B7A99",
                                    fontSize: 12,
                                    lineHeight: 1.5,
                                    marginTop: 4,
                                  }}
                                >
                                  PNG, JPG ou WEBP.
                                </p>
                              </div>

                              <label
                                className="w-full sm:w-auto rounded-2xl px-5 py-3 flex items-center justify-center gap-2"
                                style={{
                                  background: "#EBF3FF",
                                  color: "#0052CC",
                                  border: "1.5px solid #93C5FD",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  fontWeight: 800,
                                }}
                              >
                                <ImageIcon size={16} />
                                Escolher imagem
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(event) => {
                                    handleVisualTipChange(
                                      event.target.files?.[0],
                                    );
                                    event.currentTarget.value = "";
                                  }}
                                />
                              </label>
                            </div>

                            {dicaVisualPreview && (
                              <div className="mt-3 flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
                                <img
                                  src={dicaVisualPreview}
                                  alt="Dica visual selecionada"
                                  className="h-24 w-24 rounded-2xl object-cover"
                                  style={{ border: "1px solid #DBEAFE" }}
                                />
                                <button
                                  type="button"
                                  onClick={clearCurrentVisualTip}
                                  className="rounded-2xl px-4 py-3"
                                  style={{
                                    background: "#FFF0EC",
                                    border: "1px solid #FECDC3",
                                    color: "#FF5630",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 800,
                                  }}
                                >
                                  Remover imagem
                                </button>
                              </div>
                            )}
                          </Field>
                        </div>
                        {conteudos.length > 0 && (
                          <div className="mt-5 grid gap-3">
                            {conteudos.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-start sm:justify-between"
                                style={{
                                  background: "#F8FBFF",
                                  border: "1.5px solid #DBEAFE",
                                }}
                              >
                                <div className="min-w-0">
                                  <p
                                    style={{
                                      color: "#0052CC",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      marginBottom: 4,
                                    }}
                                  >
                                    Palavra {index + 1}
                                  </p>
                                  <p
                                    style={{
                                      color: "#1A2B5F",
                                      fontSize: 16,
                                      fontWeight: 800,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {item.texto}
                                  </p>
                                  <p
                                    style={{
                                      color: "#6B7A99",
                                      fontSize: 13,
                                      lineHeight: 1.5,
                                      marginTop: 6,
                                      whiteSpace: "pre-wrap",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {item.instrucao}
                                  </p>
                                  {item.dicaVisualPreview && (
                                    <img
                                      src={item.dicaVisualPreview}
                                      alt={`Dica visual de ${item.texto}`}
                                      className="mt-3 h-24 w-24 rounded-2xl object-cover"
                                      style={{ border: "1px solid #DBEAFE" }}
                                    />
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveWord(item.id)}
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                                  style={{
                                    background: "#FFF0EC",
                                    border: "1px solid #FECDC3",
                                    color: "#FF5630",
                                    cursor: "pointer",
                                  }}
                                  aria-label={`Remover ${item.texto}`}
                                  title="Remover palavra"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

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

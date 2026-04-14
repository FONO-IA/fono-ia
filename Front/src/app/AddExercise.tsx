import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { MobileWrapper } from "./MobileWrapper";
import {
  ArrowLeft,
  Dumbbell,
  Type,
  Target,
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
  Wand2,
  PlusCircle,
  X,
} from "lucide-react";

type Level = "Fácil" | "Médio" | "Avançado";

type ContentItem = {
  id: number;
  texto: string;
  instrucao: string;
};

const categoriasPadrao = [
  "Articulação",
  "Fonemas",
  "Leitura",
  "Consciência Fonológica",
  "Respiração",
  "Vocabulário",
];

const sugestoesConteudo = [
  "A",
  "E",
  "I",
  "O",
  "U",
  "PA",
  "PE",
  "PI",
  "PO",
  "PU",
  "SAPO",
  "BOLA",
];

const defaultInstruction = (texto: string) =>
  `Diga a palavra!

${texto || "A"}

💡 Como em ${texto || "ABACATE"}`;

export function AddExercise() {
  const navigate = useNavigate();

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [showNewContent, setShowNewContent] = useState(false);
  const [selectedContent, setSelectedContent] = useState("");
  const [newContent, setNewContent] = useState("");
  const [contentInstruction, setContentInstruction] = useState(
    `Diga a palavra!

A

💡 Como em ABACATE`
  );

  const [showAiBox, setShowAiBox] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const [form, setForm] = useState({
    nome: "",
    categoria: categoriasPadrao[0],
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

  const categoriaFinal =
    showNewCategory && newCategory.trim() ? newCategory.trim() : form.categoria;

  const totalConteudos = conteudos.length;

  const previewConteudo = useMemo(() => {
    return conteudos.map((item) => item.texto).join(", ");
  }, [conteudos]);

  const handleAddContent = () => {
    const textoFinal =
      showNewContent && newContent.trim()
        ? newContent.trim()
        : selectedContent.trim();

    if (!textoFinal) return;

    setConteudos((prev) => [
      ...prev,
      {
        id: Date.now(),
        texto: textoFinal,
        instrucao: contentInstruction.trim() || defaultInstruction(textoFinal),
      },
    ]);

    setSelectedContent("");
    setNewContent("");
    setContentInstruction(`Diga a palavra!

${textoFinal}

💡 Como em ${textoFinal}`);
    setShowNewContent(false);
  };

  const handleRemoveContent = (id: number) => {
    setConteudos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleContentSelect = (value: string) => {
    setSelectedContent(value);
    setShowNewContent(false);
    setContentInstruction(defaultInstruction(value));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      categoria: categoriaFinal,
      conteudos,
    };

    console.log("Novo exercício:", payload);
    navigate(-1);
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
      categoria: prev.categoria || "Fonemas",
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
        {/* Desktop */}
        <div className="hidden md:flex min-h-screen">
          <div
            className="w-96 p-8"
            style={{
              background: "linear-gradient(180deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
            }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-8 transition-all hover:opacity-80"
              style={{ background: "none", border: "none", cursor: "pointer" }}
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
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <Dumbbell size={28} color="#fff" />
              </div>

              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>
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
                Monte um exercício com conteúdo por item e instrução individual para cada palavra.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { label: "Categoria", value: categoriaFinal || "-" },
                  { label: "Nível", value: form.nivel },
                  { label: "Itens", value: `${totalConteudos}` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.12)" }}
                  >
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.72)" }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 2 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 p-10 lg:p-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 style={{ fontSize: 30, fontWeight: 700, color: "#1A2B5F" }}>
                    Cadastrar Exercício
                  </h2>
                  <p style={{ fontSize: 15, color: "#6B7A99", marginTop: 8 }}>
                    Preencha os dados ou use a IA para montar tudo automaticamente
                  </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAiBox((prev) => !prev)}
                        className="px-5 py-4 rounded-2xl flex items-center gap-2 transition-all hover:opacity-90"
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
              </div>

              {showAiBox && (
                <div
                  className="rounded-[28px] p-6 mb-6"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #DBEAFE",
                    boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A2B5F" }}>
                        Como o exercício deve ser feito?
                      </h3>
                      <p style={{ fontSize: 13, color: "#6B7A99", marginTop: 6 }}>
                        Escreva para a IA como o fono quer montar o exercício
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAiBox(false)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
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
                    style={{ ...inputStyle, height: "auto", paddingTop: 14 }}
                  />

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleGenerateWithAI}
                      className="px-5 py-3 rounded-2xl flex items-center gap-2"
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
                </div>
              )}

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div
                    className="rounded-[28px] p-8"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                    }}
                  >
                    <div className="grid grid-cols-2 gap-5">
                      <Field label="Nome do exercício" icon={<Type size={16} color="#0052CC" />}>
                        <input
                          value={form.nome}
                          onChange={(e) => updateField("nome", e.target.value)}
                          placeholder="Ex: Vogais iniciais"
                          className="w-full"
                          style={inputStyle}
                        />
                      </Field>

                      <Field label="Nível" icon={<CheckCircle2 size={16} color="#0052CC" />}>

                      <div className="flex gap-2">
                        {(["Fácil", "Médio", "Avançado"] as Level[]).map((nivel) => {
                          const isActive = form.nivel === nivel;
                          return (
                            <button
                              key={nivel}
                              type="button"
                              onClick={() => updateField("nivel", nivel)}
                              className="flex-1 py-3 rounded-2xl transition-all"
                              style={{
                                border: isActive ? "2px solid #0052CC" : "1.5px solid #DBEAFE",
                                background: isActive ? "#EBF3FF" : "#F8FBFF",
                                color: isActive ? "#0052CC" : "#6B7A99",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {nivel}
                            </button>
                          );
                        })}
                      </div>
                      </Field>

                      <div className="col-span-2">
                        <Field label="Categoria" icon={<Sparkles size={16} color="#0052CC" />}>
                          <div className="space-y-3">
                            <div className="grid grid-cols-[1fr_auto] gap-3">
                              <select
                                value={form.categoria}
                                onChange={(e) => {
                                  updateField("categoria", e.target.value);
                                  setShowNewCategory(false);
                                }}
                                className="w-full"
                                style={inputStyle}
                              >
                                {categoriasPadrao.map((categoria) => (
                                  <option key={categoria} value={categoria}>
                                    {categoria}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => setShowNewCategory((prev) => !prev)}
                                className="px-4 rounded-2xl flex items-center gap-2"
                                style={{
                                  border: "1.5px solid #DBEAFE",
                                  background: showNewCategory ? "#EBF3FF" : "#F8FBFF",
                                  color: "#0052CC",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                <PlusCircle size={16} />
                                Nova
                              </button>
                            </div>

                            {showNewCategory && (
                              <input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Digite a nova categoria"
                                className="w-full"
                                style={inputStyle}
                              />
                            )}
                          </div>
                        </Field>
                      </div>

                      <div className="col-span-2">
                        <Field label="Objetivo" icon={<Target size={16} color="#0052CC" />}>
                          <input
                            value={form.objetivo}
                            onChange={(e) => updateField("objetivo", e.target.value)}
                            placeholder="Ex: Trabalhar identificação e emissão correta"
                            className="w-full"
                            style={inputStyle}
                          />
                        </Field>
                      </div>

                      <div className="col-span-2">
                        <Field label="Instruções" icon={<FileText size={16} color="#0052CC" />}>
                          <textarea
                            value={form.instrucoesGuia}
                            onChange={(e) => updateField("instrucoesGuia", e.target.value)}
                            rows={5}
                            placeholder="Guia de texto para cada palavra"
                            className="w-full resize-none"
                            style={{ ...inputStyle, height: "auto", paddingTop: 14 }}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-[28px] p-8"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1A2B5F" }}>
                          Conteúdo do exercício
                        </h3>
                        <p style={{ fontSize: 13, color: "#6B7A99", marginTop: 6 }}>
                          Adicione cada palavra com sua própria instrução
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-[1fr_auto] gap-3">
                        <select
                          value={selectedContent}
                          onChange={(e) => handleContentSelect(e.target.value)}
                          className="w-full"
                          style={inputStyle}
                        >
                          <option value="">Selecione um conteúdo cadastrado</option>
                          {sugestoesConteudo.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => setShowNewContent((prev) => !prev)}
                          className="px-4 rounded-2xl flex items-center gap-2"
                          style={{
                            border: "1.5px solid #DBEAFE",
                            background: showNewContent ? "#EBF3FF" : "#F8FBFF",
                            color: "#0052CC",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <PlusCircle size={16} />
                          Novo
                        </button>
                      </div>

                      {showNewContent && (
                        <input
                          value={newContent}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewContent(value);
                            setContentInstruction(defaultInstruction(value));
                          }}
                          placeholder="Digite a nova palavra, sílaba ou conteúdo"
                          className="w-full"
                          style={inputStyle}
                        />
                      )}

                      <textarea
                        value={contentInstruction}
                        onChange={(e) => setContentInstruction(e.target.value)}
                        rows={6}
                        placeholder="Instrução específica deste conteúdo"
                        className="w-full resize-none"
                        style={{ ...inputStyle, height: "auto", paddingTop: 14 }}
                      />

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddContent}
                          className="px-5 py-3 rounded-2xl flex items-center gap-2"
                          style={{
                            background: "#0052CC",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          <PlusCircle size={16} />
                          Adicionar conteúdo
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {conteudos.length > 0 ? (
                        conteudos.map((item, index) => (
                          <div
                            key={item.id}
                            className="rounded-3xl p-5"
                            style={{
                              background: "#F8FBFF",
                              border: "1.5px solid #E3EEFF",
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className="px-2.5 py-1 rounded-full"
                                    style={{
                                      background: "#EBF3FF",
                                      color: "#0052CC",
                                      fontSize: 11,
                                      fontWeight: 700,
                                    }}
                                  >
                                    Item {index + 1}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 17,
                                      fontWeight: 700,
                                      color: "#1A2B5F",
                                    }}
                                  >
                                    {item.texto}
                                  </span>
                                </div>

                                <p
                                  style={{
                                    fontSize: 13,
                                    color: "#4C5B7C",
                                    whiteSpace: "pre-wrap",
                                    lineHeight: 1.7,
                                  }}
                                >
                                  {item.instrucao}
                                </p>
                              </div>

                              <button
                                onClick={() => handleRemoveContent(item.id)}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{
                                  border: "none",
                                  cursor: "pointer",
                                  background: "#FFECEC",
                                }}
                              >
                                <X size={16} color="#D14343" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          className="rounded-3xl p-5"
                          style={{
                            background: "#F8FBFF",
                            border: "1.5px dashed #C9DBFF",
                          }}
                        >
                          <p style={{ fontSize: 14, color: "#7B8AAC" }}>
                            Nenhum conteúdo adicionado ainda.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="px-6 py-4 rounded-2xl flex items-center justify-center gap-2"
                            style={{
                            background: "linear-gradient(135deg, #36B37E, #57D9A3)",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 15,
                            fontWeight: 700,
                            boxShadow: "0 12px 28px rgba(54,179,126,0.22)",
                            minWidth: 220,
                            }}
                        >
                            <Save size={18} />
                            Salvar Exercício
                        </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    className="rounded-[28px] p-6"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #DBEAFE",
                      boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                    }}
                  >
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A2B5F", marginBottom: 16 }}>
                      Pré-visualização
                    </h3>

                    <div
                      className="rounded-3xl p-5"
                      style={{
                        background: "linear-gradient(135deg, #0052CC, #0065FF)",
                        color: "#fff",
                      }}
                    >
                      <p style={{ fontSize: 12, opacity: 0.75 }}>Nome</p>
                      <h4 style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
                        {form.nome || "Novo exercício"}
                      </h4>

                      <div className="mt-5 space-y-3">
                        <PreviewItem label="Categoria" value={categoriaFinal || "-"} />
                        <PreviewItem label="Objetivo" value={form.objetivo || "-"} />
                        <PreviewItem label="Nível" value={form.nivel} />
                        <PreviewItem label="Itens" value={`${totalConteudos}`} />
                      </div>
                    </div>

                    <div className="mt-5">
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1A2B5F", marginBottom: 10 }}>
                        Resumo do conteúdo
                      </p>

                      <div
                        className="rounded-2xl p-4"
                        style={{ background: "#F8FBFF", border: "1.5px solid #E3EEFF" }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            color: "#4C5B7C",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                          }}
                        >
                          {previewConteudo || "Nenhum conteúdo informado ainda."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1A2B5F", marginBottom: 10 }}>
                        Guia de instruções
                      </p>

                      <div
                        className="rounded-2xl p-4"
                        style={{ background: "#F8FBFF", border: "1.5px solid #E3EEFF" }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            color: "#4C5B7C",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.7,
                          }}
                        >
                          {form.instrucoesGuia}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden min-h-screen">
          <div
            className="px-6 pt-14 pb-8"
            style={{
              background: "linear-gradient(150deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
            }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <ArrowLeft size={20} color="rgba(255,255,255,0.9)" />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>Voltar</span>
            </button>

            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <Dumbbell size={24} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                  Adicionar Exercício
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
                  Conteúdo por item com instrução individual
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 -mt-4 pb-8 space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setShowAiBox((prev) => !prev)}
                className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2"
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
              <div
                className="rounded-[28px] p-5"
                style={{
                  background: "#fff",
                  border: "1.5px solid #DBEAFE",
                  boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A2B5F" }}>
                    Como o exercício deve ser feito?
                  </h3>

                  <button
                    onClick={() => setShowAiBox(false)}
                    style={{ border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    <X size={18} color="#7B8AAC" />
                  </button>
                </div>

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  placeholder="Ex: Criar um exercício com vogais e dica visual em cada item."
                  className="w-full resize-none"
                  style={{ ...inputStyle, height: "auto", paddingTop: 14 }}
                />

                <button
                  onClick={handleGenerateWithAI}
                  className="w-full mt-4 py-4 rounded-2xl flex items-center justify-center gap-2"
                  style={{
                    background: "#0052CC",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <Wand2 size={18} />
                  Gerar exercício
                </button>
              </div>
            )}

            <div
              className="rounded-[28px] p-5"
              style={{
                background: "#fff",
                border: "1.5px solid #DBEAFE",
                boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
              }}
            >
              <div className="space-y-4">
                <Field label="Nome do exercício" icon={<Type size={16} color="#0052CC" />}>
                  <input
                    value={form.nome}
                    onChange={(e) => updateField("nome", e.target.value)}
                    placeholder="Ex: Vogais iniciais"
                    className="w-full"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Categoria" icon={<Sparkles size={16} color="#0052CC" />}>
                  <div className="space-y-3">
                    <select
                      value={form.categoria}
                      onChange={(e) => {
                        updateField("categoria", e.target.value);
                        setShowNewCategory(false);
                      }}
                      className="w-full"
                      style={inputStyle}
                    >
                      {categoriasPadrao.map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowNewCategory((prev) => !prev)}
                      className="w-full h-[52px] rounded-2xl flex items-center justify-center gap-2"
                      style={{
                        border: "1.5px solid #DBEAFE",
                        background: showNewCategory ? "#EBF3FF" : "#F8FBFF",
                        color: "#0052CC",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <PlusCircle size={16} />
                      Cadastrar nova categoria
                    </button>

                    {showNewCategory && (
                      <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Digite a nova categoria"
                        className="w-full"
                        style={inputStyle}
                      />
                    )}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nível" icon={<CheckCircle2 size={16} color="#0052CC" />}>
                    <select
                      value={form.nivel}
                      onChange={(e) => updateField("nivel", e.target.value)}
                      className="w-full"
                      style={inputStyle}
                    >
                      <option>Fácil</option>
                      <option>Médio</option>
                      <option>Avançado</option>
                    </select>
                  </Field>

                  <Field label="Ativo" icon={<CheckCircle2 size={16} color="#0052CC" />}>
                    <button
                      onClick={() => updateField("ativo", !form.ativo)}
                      className="w-full h-[52px] rounded-2xl"
                      style={{
                        border: "1.5px solid #DBEAFE",
                        background: form.ativo ? "#ECFDF5" : "#F8FAFC",
                        color: form.ativo ? "#36B37E" : "#7B8AAC",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {form.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </Field>
                </div>

                <Field label="Objetivo" icon={<Target size={16} color="#0052CC" />}>
                  <input
                    value={form.objetivo}
                    onChange={(e) => updateField("objetivo", e.target.value)}
                    placeholder="Ex: Trabalhar identificação e emissão correta"
                    className="w-full"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Instruções" icon={<FileText size={16} color="#0052CC" />}>
                  <textarea
                    value={form.instrucoesGuia}
                    onChange={(e) => updateField("instrucoesGuia", e.target.value)}
                    rows={5}
                    className="w-full resize-none"
                    style={{ ...inputStyle, height: "auto", paddingTop: 14 }}
                  />
                </Field>
              </div>
            </div>

            <div
              className="rounded-[28px] p-5"
              style={{
                background: "#fff",
                border: "1.5px solid #DBEAFE",
                boxShadow: "0 4px 16px rgba(0,82,204,0.05)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A2B5F", marginBottom: 12 }}>
                Conteúdo
              </h3>

              <div className="space-y-3">
                <select
                  value={selectedContent}
                  onChange={(e) => handleContentSelect(e.target.value)}
                  className="w-full"
                  style={inputStyle}
                >
                  <option value="">Selecione um conteúdo cadastrado</option>
                  {sugestoesConteudo.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowNewContent((prev) => !prev)}
                  className="w-full h-[52px] rounded-2xl flex items-center justify-center gap-2"
                  style={{
                    border: "1.5px solid #DBEAFE",
                    background: showNewContent ? "#EBF3FF" : "#F8FBFF",
                    color: "#0052CC",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <PlusCircle size={16} />
                  Cadastrar novo conteúdo
                </button>

                {showNewContent && (
                  <input
                    value={newContent}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewContent(value);
                      setContentInstruction(defaultInstruction(value));
                    }}
                    placeholder="Digite a nova palavra, sílaba ou conteúdo"
                    className="w-full"
                    style={inputStyle}
                  />
                )}

                <textarea
                  value={contentInstruction}
                  onChange={(e) => setContentInstruction(e.target.value)}
                  rows={6}
                  className="w-full resize-none"
                  style={{ ...inputStyle, height: "auto", paddingTop: 14 }}
                />

                <button
                  type="button"
                  onClick={handleAddContent}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                  style={{
                    background: "#0052CC",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <PlusCircle size={16} />
                  Adicionar conteúdo
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {conteudos.length > 0 ? (
                  conteudos.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-2xl p-4"
                      style={{ background: "#F8FBFF", border: "1.5px solid #E3EEFF" }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#1A2B5F" }}>
                            {index + 1}. {item.texto}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#4C5B7C",
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.7,
                              marginTop: 8,
                            }}
                          >
                            {item.instrucao}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveContent(item.id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{
                            border: "none",
                            background: "#FFECEC",
                            cursor: "pointer",
                          }}
                        >
                          <X size={15} color="#D14343" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "#F8FBFF", border: "1.5px dashed #C9DBFF" }}
                  >
                    <p style={{ fontSize: 13, color: "#7B8AAC" }}>
                      Nenhum conteúdo adicionado ainda.
                    </p>
                  </div>
                )}
              </div>
                <button
                    onClick={handleSave}
                    className="w-full mt-5 py-4 rounded-2xl flex items-center justify-center gap-2"
                    style={{
                        background: "linear-gradient(135deg, #36B37E, #57D9A3)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                        boxShadow: "0 10px 22px rgba(54,179,126,0.2)",
                    }}
                    >
                    <Save size={18} />
                    Salvar Exercício
                </button>
            </div>
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
    <div>
      <label
        className="flex items-center gap-2 mb-2"
        style={{ fontSize: 13, fontWeight: 600, color: "#1A2B5F" }}
      >
        {icon}
        {label}
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
      <p style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{value}</p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 16,
  border: "1.5px solid #DBEAFE",
  background: "#F8FBFF",
  padding: "0 16px",
  fontFamily: "'Poppins', sans-serif",
  fontSize: 14,
  color: "#1A2B5F",
  outline: "none",
};
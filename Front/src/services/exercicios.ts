import { api } from "./api";

export type ConteudoExercicioPayload = {
  texto: string;
  instrucao: string;
  dicaVisual?: File | null;
};

export type CreateExercicioPayload = {
  nome?: string;
  nivel: string;
  categoria: string;
  conteudo: string;
  objetivo: string;
  instrucao: string;
  paciente?: string[];
  palavras?: string[];
  conteudos: ConteudoExercicioPayload[];
};

export type AiSuggestionPayload = {
  categoria: string;
  nivel: string;
  objetivo?: string;
};

export type AiSuggestionResponse = {
  sugestao: string;
};

export type Exercicio = {
  id: string;
  nome?: string;
  titulo?: string;
  descricao?: string;
  nivel: string;
  categoria: string;
  conteudo: string;
  objetivo: string;
  instrucao: string;
  created_at?: string;
  updated_at?: string;
  nivel_display: string;
  concluido: boolean;
  status?: string;
  dificuldade?: string | number;
  prazo?: string | null;
  audio_url?: string | null;
  ultimo_resultado_id?: string | null;
  ultimo_feedback?: Record<string, unknown> | null;
  referencia_url?: string | null;
  palavras?: string[];
  conteudos?: Array<{
    id: string | number;
    texto: string;
    instrucao: string;
    dica_visual?: string | null;
    dica_visual_url?: string | null;
    audio_url?: string | null;
    resultado_id?: string | null;
    feedback?: Record<string, unknown> | null;
  }>;
  paciente: string | string[];
};

export type RespostaExercicio = {
  id: string;
  detail: string;
  concluido: boolean;
  feedback: Record<string, unknown>;
  audio_url?: string | null;
};

export type VoiceAssessmentPayload = {
  palavraAlvo: string;
  transcricao: string;
  correto: boolean;
  similaridade: number;
  confianca?: number;
  conteudoId?: string;
};

function hasVisualTipFiles(payload: CreateExercicioPayload) {
  return payload.conteudos.some((item) => Boolean(item.dicaVisual));
}

function buildExerciseFormData(payload: CreateExercicioPayload) {
  const formData = new FormData();

  if (payload.nome) formData.append("nome", payload.nome);
  formData.append("nivel", payload.nivel);
  formData.append("categoria", payload.categoria);
  formData.append("conteudo", payload.conteudo);
  formData.append("objetivo", payload.objetivo);
  formData.append("instrucao", payload.instrucao);
  formData.append("paciente", JSON.stringify(payload.paciente || []));
  formData.append("palavras", JSON.stringify(payload.palavras || []));
  formData.append(
    "conteudos",
    JSON.stringify(
      payload.conteudos.map((item) => ({
        texto: item.texto,
        instrucao: item.instrucao,
      })),
    ),
  );

  payload.conteudos.forEach((item, index) => {
    if (item.dicaVisual) {
      formData.append(
        `dica_visual_${index}`,
        item.dicaVisual,
        item.dicaVisual.name,
      );
    }
  });

  return formData;
}

export async function criarExercicio(payload: CreateExercicioPayload) {
  if (hasVisualTipFiles(payload)) {
    return api.postForm<Exercicio>("/exercicios/", buildExerciseFormData(payload));
  }

  return api.post<Exercicio>("/exercicios/", {
    ...payload,
    conteudos: payload.conteudos.map((item) => ({
      texto: item.texto,
      instrucao: item.instrucao,
    })),
  });
}

export async function gerarSugestaoExercicio(payload: AiSuggestionPayload) {
  return api.post<AiSuggestionResponse>("/exercicios/ia-sugestao/", payload);
}

export async function listarExercicios(params?: { paciente?: string }) {
  const search = new URLSearchParams();

  if (params?.paciente) {
    search.set("paciente", params.paciente);
  }

  const query = search.toString();

  return api.get<Exercicio[]>(`/exercicios/${query ? `?${query}` : ""}`);
}

export async function buscarExercicioPorId(id: string, pacienteId?: string) {
  const search = new URLSearchParams();

  if (pacienteId) {
    search.set("paciente", pacienteId);
  }

  const query = search.toString();

  return api.get<Exercicio>(`/exercicios/${id}/${query ? `?${query}` : ""}`);
}

export async function enviarRespostaExercicio(
  exercicioId: string,
  audioBlob: Blob,
  pacienteId?: string,
  voiceAssessment?: VoiceAssessmentPayload,
) {
  const formData = new FormData();
  formData.append("audio", audioBlob, `resposta-${exercicioId}.wav`);

  if (pacienteId) {
    formData.append("paciente_id", pacienteId);
  }

  if (voiceAssessment) {
    formData.append("palavra_alvo", voiceAssessment.palavraAlvo);
    formData.append("transcricao", voiceAssessment.transcricao);
    formData.append("correto", String(voiceAssessment.correto));
    formData.append("similaridade", String(voiceAssessment.similaridade));

    if (voiceAssessment.confianca !== undefined) {
      formData.append("confianca", String(voiceAssessment.confianca));
    }

    if (voiceAssessment.conteudoId) {
      formData.append("conteudo_id", voiceAssessment.conteudoId);
    }
  }

  return api.postForm<RespostaExercicio>(
    `/exercicios/${exercicioId}/responder/`,
    formData,
  );
}

import { api } from "./api";

export type ConteudoExercicioPayload = {
  texto: string;
  instrucao: string;
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

export type SugestaoExercicioIARequest = {
  categoria: string;
  nivel: string;
  objetivo?: string;
};

export type SugestaoExercicioIA = {
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
  referencia_url?: string | null;
  palavras?: string[];
  conteudos?: Array<{
    id: string | number;
    texto: string;
    instrucao: string;
  }>;
  paciente: string | string[];
};

export type RespostaExercicio = {
  id: string;
  detail: string;
  concluido: boolean;
  feedback: string;
};

export async function criarExercicio(payload: CreateExercicioPayload) {
  return api.post<Exercicio>("/exercicios/", payload);
}

export async function sugerirExercicioComIA(
  payload: SugestaoExercicioIARequest,
) {
  return api.post<SugestaoExercicioIA>("/exercicios/ia-sugestao/", payload);
}

export async function listarExercicios(params?: { paciente?: string }) {
  const search = new URLSearchParams();

  if (params?.paciente) {
    search.set("paciente", params.paciente);
  }

  const query = search.toString();

  return api.get<Exercicio[]>(`/exercicios/${query ? `?${query}` : ""}`);
}

export async function buscarExercicioPorId(id: string) {
  return api.get<Exercicio>(`/exercicios/${id}/`);
}

export async function criarResultadoExercicio(
  exercicioId: string,
  feedback: any,
) {
  const feedbackJson = typeof feedback === 'object' 
    ? JSON.stringify(feedback) 
    : feedback;
    
  return api.post<Resultado>("/resultados/", {
    exercicio: exercicioId,
    feedback: JSON.parse(feedbackJson)
  });
}

// Tipo para o retorno do resultado
export type Resultado = {
  id: string;
  exercicio: string;
  feedback: any;
//  created_at: string;
//  updated_at: string;
};

export async function enviarRespostaExercicio(
  exercicioId: string,
  audioBlob: Blob,
  pacienteId?: string,
) {
  const formData = new FormData();
  formData.append("audio", audioBlob, `resposta-${exercicioId}.wav`);

  if (pacienteId) {
    formData.append("paciente_id", pacienteId);
  }

  return api.postForm<RespostaExercicio>(
    `/exercicios/${exercicioId}/responder/`,
    formData,
  );
}

export async function uploadConteudoAudioReferencia(
  exercicioId: string,
  conteudoId: string | number,
  audioBlob: Blob,
) {
  const formData = new FormData();
  formData.append("audio", audioBlob, `referencia-${conteudoId}.wav`);

  return api.postForm<Exercicio>(
    `/exercicios/${exercicioId}/conteudos/${conteudoId}/referencia/`,
    formData,
  );
}

export async function editarExercicio(
  id: string,
  payload: CreateExercicioPayload,
) {
  return api.patch<Exercicio>(`/exercicios/${id}/`, payload);
}

export async function excluirExercicio(id: string) {
  await api.delete(`/exercicios/${id}/`);
  return true;
}

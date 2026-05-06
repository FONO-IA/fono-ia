import { api } from "./api";

export type ConteudoExercicioPayload = {
  texto: string;
  instrucao: string;
};

export type CreateExercicioPayload = {
  nivel: string;
  categoria: string;
  conteudo: string;
  objetivo: string;
  instrucao: string;
  conteudos: ConteudoExercicioPayload[];
};

export type Exercicio = {
  id: string;
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
  feedback: Record<string, unknown>;
};

export async function criarExercicio(payload: CreateExercicioPayload) {
  return api.post<Exercicio>("/exercicios/", payload);
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

export async function enviarRespostaExercicio(
  exercicioId: string,
  audioBlob: Blob,
  pacienteId?: string,
) {
  const formData = new FormData();
  formData.append("audio", audioBlob, `resposta-${exercicioId}.webm`);

  if (pacienteId) {
    formData.append("paciente_id", pacienteId);
  }

  return api.postForm<RespostaExercicio>(
    `/exercicios/${exercicioId}/responder/`,
    formData,
  );
}

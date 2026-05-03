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
  nivel: string;
  categoria: string;
  conteudo: string;
  objetivo: string;
  instrucao: string;
  created_at?: string;
  updated_at?: string;
  nivel_display: string;
  concluido: boolean;
  paciente: string;
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

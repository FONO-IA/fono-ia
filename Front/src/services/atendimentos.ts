import { api } from "./api";

export type Atendimento = {
  id: string;
  paciente: string;
  paciente_nome?: string;
  fonoaudiologo?: string;
  fonoaudiologo_nome?: string;
  exercicio: string;
  exercicio_categoria?: string;
  exercicio_nivel?: string;
  observacoes?: string;
  concluido: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function listarAtendimentos(params?: {
  paciente?: string;
  fonoaudiologo?: string;
}) {
  const search = new URLSearchParams();

  if (params?.paciente) search.set("paciente", params.paciente);
  if (params?.fonoaudiologo) search.set("fonoaudiologo", params.fonoaudiologo);

  const query = search.toString();

  return api.get<Atendimento[]>(`/resultados/${query ? `?${query}` : ""}`);
}
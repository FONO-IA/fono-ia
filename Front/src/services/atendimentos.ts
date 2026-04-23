import { api } from "./api";

export type Atendimento = {
  id: string;
  paciente: string;
  fonoaudiologo: string;
  exercicio: string;
  observacoes?: string;
  concluido: boolean;
};

export async function listarAtendimentos() {
  return api.get<Atendimento[]>("/atendimentos/");
}
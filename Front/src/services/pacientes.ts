import { api } from "./api";
import type { Exercicio } from "./exercicios";

export type Paciente = {
  id: string;
  nome: string;
  data_nascimento: string;
  observacoes?: string;
  responsavel?: string;
  responsavel_nome?: string;
  total_exercicios?: number;
  exercicios_concluidos?: number;
  ultima_sessao?: string;
};

export type CreatePacientePayload = {
  nome: string;
  data_nascimento: string;
  observacoes?: string;
  responsavel: string;
};

export async function listarPacientes() {
  return api.get<Paciente[]>("/pacientes/");
}

export async function criarPaciente(payload: CreatePacientePayload) {
  return api.post<Paciente>("/pacientes/", payload);
}

export async function listarExerciciosDoPaciente(pacienteId: string) {
  return api.get<Exercicio[]>(`/pacientes/${pacienteId}/exercicios/`);
}

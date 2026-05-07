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

export type ResultadoResumo = {
  id: string;
  exercicio: string;
  exercicio_categoria?: string;
  exercicio_nivel?: string;
  observacoes?: string;
  concluido: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProgressoPaciente = {
  paciente: string;
  total_exercicios: number;
  pendentes: number;
  concluidos: number;
  em_andamento: number;
  sessoes_feitas: number;
  ultimo_exercicio?: {
    id: string;
    titulo: string;
    categoria: string;
  } | null;
  ultima_sessao?: string | null;
  progresso: number;
  resultados: ResultadoResumo[];
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

export async function buscarPaciente(id: string) {
  return api.get<Paciente>(`/pacientes/${id}/`);
}

export async function criarPaciente(payload: CreatePacientePayload) {
  return api.post<Paciente>("/pacientes/", payload);
}

export async function listarExerciciosDoPaciente(pacienteId: string) {
  return api.get<Exercicio[]>(`/pacientes/${pacienteId}/exercicios/`);
}

export const listarExerciciosPorPaciente = listarExerciciosDoPaciente;

export async function buscarProgressoPaciente(pacienteId: string) {
  return api.get<ProgressoPaciente>(`/pacientes/${pacienteId}/progresso/`);
}

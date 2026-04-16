import { api } from "./api";

export type ResponsavelPayload = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
};

export type Responsavel = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
};

export type PacientePayload = {
  nome: string;
  data_nascimento: string;
  observacoes?: string;
  responsavel: string;
};

export type Paciente = {
  id: string;
  nome: string;
  data_nascimento: string;
  observacoes?: string;
  responsavel: string;
  responsavel_nome?: string;
};

export async function criarResponsavel(payload: ResponsavelPayload) {
  return api.post<Responsavel>("/responsaveis/", payload);
}

export async function criarPaciente(payload: PacientePayload) {
  return api.post<Paciente>("/pacientes/", payload);
}

export async function listarPacientes(nome?: string) {
  return api.get<any[]>("/pacientes/");
}
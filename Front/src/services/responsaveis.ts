import { api } from "./api";
import type { Paciente } from "./pacientes";

export type Responsavel = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  username?: string;
  password?: string;
};

export type CreateResponsavelPayload = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  username: string;
  password: string;
};

export async function criarResponsavel(payload: CreateResponsavelPayload) {
  return api.post<Responsavel>("/responsaveis/", payload);
}

export async function listarResponsaveis() {
  return api.get<Responsavel[]>("/responsaveis/");
}

export async function buscarResponsavelPorId(id: string) {
  return api.get<Responsavel>(`/responsaveis/${id}/`);
}

export async function buscarResponsavelLogado() {
  return api.get<Responsavel>("/responsaveis/me/");
}

export async function listarPacientesDoResponsavelLogado() {
  return api.get<Paciente[]>("/responsaveis/me/pacientes/");
}

import { api } from "./api";

export type Responsavel = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
};

export type CreateResponsavelPayload = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
};

export async function criarResponsavel(payload: CreateResponsavelPayload) {
  return api.post<Responsavel>("/responsaveis/", payload);
}
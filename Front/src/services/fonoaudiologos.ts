import { api } from "./api";

export type Fonoaudiologo = {
  id: string;
  nome: string;
  cpf: string;
  crfa: string;
  telefone: string;
  email: string;
};

export type CreateFonoaudiologoPayload = {
  nome: string;
  cpf: string;
  crfa: string;
  telefone: string;
  email: string;
};

export async function listarFonoaudiologos() {
  return api.get<Fonoaudiologo[]>("/fonoaudiologos/");
}

export async function criarFonoaudiologo(payload: CreateFonoaudiologoPayload) {
  return api.post<Fonoaudiologo>("/fonoaudiologos/", payload);
}
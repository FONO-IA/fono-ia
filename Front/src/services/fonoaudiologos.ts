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
  username: string;
  password: string;
};

export async function listarFonoaudiologos() {
  return api.get<Fonoaudiologo[]>("/fonoaudiologos/");
}

export async function criarFonoaudiologo(payload: CreateFonoaudiologoPayload) {
  return api.post<Fonoaudiologo>("/fonoaudiologos/", payload);
}

export async function getMe() {
  const response = await api.get("/fonoaudiologos/me/");
  return response;
}

import { api } from "./api";

type LoginResponse = {
  access: string;
  refresh: string;
};

export type MeResponse = {
  nome: string;
  cpf?: string;
  crfa: string;
  telefone?: string;
  email?: string;
};

export async function login(email: string, password: string) {
  const response = await fetch("http://127.0.0.1:8000/api/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail);
  }


  localStorage.setItem("token", data.access);
  localStorage.setItem("refresh", data.refresh);

  return data;
}

export async function getMe() {
  return api.get<MeResponse>("/fonoaudiologos/me/");
}

export async function alterarSenha(payload: {
  senha_atual: string;
  nova_senha: string;
}) {
  return api.post("/fonoaudiologos/alterar_senha/", payload);
}
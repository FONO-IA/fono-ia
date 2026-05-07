import { api } from "./api";
import {
  clearAuthSession,
  getDefaultRouteForRole,
  saveAuthSession,
  type AuthRole,
} from "./session";

const AUTH_URL = "http://127.0.0.1:8000/api/token/";

type LoginResponse = {
  access: string;
  refresh: string;
};

export type MeResponse = {
  id?: string;
  nome: string;
  cpf?: string;
  crfa?: string;
  telefone?: string;
  email?: string;
};

async function requestToken(username: string, password: string) {
  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Dados de acesso invalidos.");
  }

  return data as LoginResponse;
}

async function loginWithRole(
  username: string,
  password: string,
  role: AuthRole,
  mePath: string,
) {
  clearAuthSession();
  const tokens = await requestToken(username, password);

  saveAuthSession({
    access: tokens.access,
    refresh: tokens.refresh,
    role,
  });

  try {
    const user = await api.get<MeResponse>(mePath);
    saveAuthSession({
      access: tokens.access,
      refresh: tokens.refresh,
      role,
      user,
    });

    return {
      ...tokens,
      role,
      user,
      redirectTo: getDefaultRouteForRole(role),
    };
  } catch (err) {
    clearAuthSession();
    throw err;
  }
}

export async function loginProfessional(username: string, password: string) {
  return loginWithRole(
    username,
    password,
    "profissional",
    "/fonoaudiologos/me/",
  );
}

export async function loginResponsible(username: string, password: string) {
  return loginWithRole(
    username,
    password,
    "responsavel",
    "/responsaveis/me/",
  );
}

export async function login(username: string, password: string) {
  try {
    return await loginProfessional(username, password);
  } catch {
    return loginResponsible(username, password);
  }
}

export function logout() {
  clearAuthSession();
}

export async function getMe() {
  return api.get<MeResponse>("/fonoaudiologos/me/");
}

export async function getResponsavelMe() {
  return api.get<MeResponse>("/responsaveis/me/");
}

export async function alterarSenha(payload: {
  senha_atual: string;
  nova_senha: string;
}) {
  return api.post("/fonoaudiologos/alterar_senha/", payload);
}

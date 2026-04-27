import { api } from "./api";

// export async function getMe() {
//   const response = await api.get("/fonoaudiologos/me/");
//   return response;
// }

type MeResponse = {
  nome: string;
  crfa: string;
};

export async function getMe() {
  return api.get<MeResponse>("/fonoaudiologos/me/");
}

// export async function getMe() {
//   return await api.get<ApiFono>("/fonoaudiologos/me/");
// }

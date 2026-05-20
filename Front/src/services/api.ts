import { clearAuthSession, getAccessToken } from "./session";

const API_BASE_URL = "http://127.0.0.1:8001/api/v1";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getAccessToken();
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body !== undefined
        ? isFormData
          ? options.body
          : JSON.stringify(options.body)
        : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession({ redirect: true });
    }

    console.error("Erro da API:", response.status, data);

    const message =
      typeof data === "string"
        ? data
        : data?.detail ||
          Object.entries(data || {})
            .map(([field, messages]) => {
              const text = Array.isArray(messages)
                ? messages.join(", ")
                : String(messages);
              return `${field}: ${text}`;
            })
            .join(" | ") ||
          `Erro HTTP ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body,
    }),

  postForm: <T>(path: string, body: FormData) =>
    request<T>(path, {
      method: "POST",
      body,
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      body,
    }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body,
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};

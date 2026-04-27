const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

type RequestOptions = RequestInit & {
  body?: unknown;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
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
    request<T>(path, { method: "POST", body: body as RequestOptions["body"] }),
};

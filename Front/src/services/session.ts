export type AuthRole =
  | "fonoaudiologo"
  | "profissional"
  | "responsavel"
  | "paciente";

export type AuthSession = {
  access: string;
  refresh?: string;
  role: AuthRole;
  user?: unknown;
};

const AUTH_KEYS = [
  "access",
  "refresh",
  "token",
  "accessToken",
  "refreshToken",
  "user",
  "userType",
  "role",
  "profile",
  "userRole",
  "selectedPatient",
  "selectedResponsavel",
  "pacienteSelecionado",
  "responsavelSelecionado",
  "auth",
  "fonoIaAuth",
  "fonoia-auth",
];

function getStorage(storage: Storage | undefined, key: string) {
  try {
    return storage?.getItem(key) || null;
  } catch {
    return null;
  }
}

function setStorage(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Storage can be unavailable in private mode.
  }
}

function removeStorage(storage: Storage | undefined, key: string) {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage can be unavailable in private mode.
  }
}

function storage() {
  if (typeof window === "undefined") {
    return { local: undefined, session: undefined };
  }

  return {
    local: window.localStorage,
    session: window.sessionStorage,
  };
}

export function normalizeRole(value?: string | null): AuthRole | null {
  const role = value
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!role) return null;
  if (["fonoaudiologo", "fono", "profissional", "professional"].includes(role)) {
    return "profissional";
  }
  if (["responsavel", "paciente", "patient", "child"].includes(role)) {
    return "responsavel";
  }

  return null;
}

export function getAccessToken() {
  const { local } = storage();
  const token = getStorage(local, "token") || getStorage(local, "access");

  if (!token || token === "undefined" || token === "null" || !token.trim()) {
    return null;
  }

  return token;
}

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );

    return JSON.parse(window.atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + 10;
}

export function clearAuthSession(options: { redirect?: boolean } = {}) {
  const { local, session } = storage();

  AUTH_KEYS.forEach((key) => {
    removeStorage(local, key);
    removeStorage(session, key);
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fono-ia-auth-changed"));

    if (options.redirect && window.location.pathname !== "/") {
      window.location.replace("/");
    }
  }
}

export function saveAuthSession(session: AuthSession) {
  const { local } = storage();

  setStorage(local, "token", session.access);
  setStorage(local, "access", session.access);

  if (session.refresh) {
    setStorage(local, "refresh", session.refresh);
    setStorage(local, "refreshToken", session.refresh);
  }

  setStorage(local, "userRole", session.role);
  setStorage(local, "role", session.role);

  if (session.user !== undefined) {
    setStorage(local, "user", JSON.stringify(session.user));
    setStorage(local, "profile", JSON.stringify(session.user));
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fono-ia-auth-changed"));
  }
}

export function getValidAuthSession() {
  const token = getAccessToken();

  if (!token || isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }

  const { local } = storage();
  const role = normalizeRole(
    getStorage(local, "userRole") || getStorage(local, "role"),
  );

  if (!role) {
    clearAuthSession();
    return null;
  }

  return {
    access: token,
    refresh: getStorage(local, "refresh") || undefined,
    role,
  };
}

export function roleMatches(role: AuthRole, allowedRoles?: AuthRole[]) {
  if (!allowedRoles?.length) return true;

  const normalizedRole = normalizeRole(role);
  return allowedRoles.some((allowedRole) => {
    const normalizedAllowed = normalizeRole(allowedRole);
    return normalizedAllowed === normalizedRole;
  });
}

export function getDefaultRouteForRole(role?: AuthRole | null) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "responsavel") return "/child/home";
  if (normalizedRole === "profissional") return "/admin";

  return "/";
}

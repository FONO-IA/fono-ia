import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import {
  getDefaultRouteForRole,
  getValidAuthSession,
  roleMatches,
  type AuthRole,
} from "../services/session";

type ProtectedRouteProps = {
  allowedRoles?: AuthRole[];
};

function ValidationScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ fontFamily: "'Poppins', sans-serif", background: "#F4F7FF" }}
    >
      <p style={{ color: "#1A2B5F", fontSize: 15, fontWeight: 700 }}>
        Validando sessao...
      </p>
    </div>
  );
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const [validatedAt, setValidatedAt] = useState(() => Date.now());

  useEffect(() => {
    const revalidate = () => setValidatedAt(Date.now());

    window.addEventListener("storage", revalidate);
    window.addEventListener("pageshow", revalidate);
    window.addEventListener("focus", revalidate);
    window.addEventListener("fono-ia-auth-changed", revalidate);

    return () => {
      window.removeEventListener("storage", revalidate);
      window.removeEventListener("pageshow", revalidate);
      window.removeEventListener("focus", revalidate);
      window.removeEventListener("fono-ia-auth-changed", revalidate);
    };
  }, []);

  const session = getValidAuthSession();
  void validatedAt;

  if (!session) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!roleMatches(session.role, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(session.role)} replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const session = getValidAuthSession();

  if (session) {
    return <Navigate to={getDefaultRouteForRole(session.role)} replace />;
  }

  return <Outlet />;
}

export { ValidationScreen };

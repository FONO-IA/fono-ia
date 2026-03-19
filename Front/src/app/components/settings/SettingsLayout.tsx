import React from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft,
  User,
  Bell,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  LogOut,
  Crown,
} from "lucide-react";
import { MobileWrapper } from "../../MobileWrapper";

interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

const settingsMenu = [
  {
    path: "/settings/perfil",
    label: "Perfil Profissional",
    icon: User,
    iconBg: "#EBF3FF",
    iconColor: "#0052CC",
  },
  {
    path: "/settings/notificacoes",
    label: "Notificações",
    icon: Bell,
    iconBg: "#FFFBEB",
    iconColor: "#FFAB00",
  },
  {
    path: "/settings/privacidade",
    label: "Privacidade & LGPD",
    icon: ShieldCheck,
    iconBg: "#ECFDF5",
    iconColor: "#36B37E",
  },
  {
    path: "/settings/plano",
    label: "Plano & Assinatura",
    icon: CreditCard,
    iconBg: "#F3F0FF",
    iconColor: "#998DD9",
  },
  {
    path: "/settings/suporte",
    label: "Suporte",
    icon: HelpCircle,
    iconBg: "#EBF3FF",
    iconColor: "#0052CC",
  },
  {
    path: "/settings/sair",
    label: "Sair da conta",
    icon: LogOut,
    iconBg: "#FFE0D5",
    iconColor: "#FF5630",
  },
];

export function SettingsLayout({
  title,
  subtitle,
  children,
  headerRight,
  noPadding = false,
}: SettingsLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <MobileWrapper bgColor="#EBF3FF" desktopMode="full">
      <div
        className="flex min-h-screen"
        style={{
          fontFamily: "'Poppins', sans-serif",
          background: "#F4F7FF",
        }}
      >
        <style>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}</style>

        {/* Desktop Sidebar - Hidden on mobile */}
        <div
          className="hidden md:flex md:flex-col md:w-72 lg:w-80 min-h-screen"
          style={{
            background:
              "linear-gradient(180deg, #003884 0%, #0052CC 50%, #0065FF 100%)",
          }}
        >
          {/* Logo */}
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: 1.5,
                  }}
                >
                  FONO<span style={{ opacity: 0.9 }}>-IA</span>
                </h2>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 400,
                  }}
                >
                  Portal Profissional
                </p>
              </div>
            </div>
          </div>

          {/* Profile card */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  PA
                </span>
              </div>
              <div className="flex-1">
                <p
                  style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}
                >
                  Dr. Paulo Andrade
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 400,
                  }}
                >
                  CRFa 6-7832
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Crown size={12} color="#FFD700" />
              <span
                style={{ fontSize: 11, fontWeight: 600, color: "#FFD700" }}
              >
                Plano Pro
              </span>
            </div>
          </div>

          {/* Settings Navigation */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="p-4">
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 8,
                  paddingLeft: 12,
                }}
              >
                Configurações
              </p>
              <nav className="space-y-1">
                {settingsMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200"
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.2)"
                          : "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          background: isActive
                            ? "rgba(255,255,255,0.25)"
                            : "rgba(255,255,255,0.15)",
                        }}
                      >
                        <Icon
                          size={16}
                          color={isActive ? "#fff" : "rgba(255,255,255,0.7)"}
                          strokeWidth={isActive ? 2.5 : 1.8}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                        }}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={20} color="rgba(255,255,255,0.6)" />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Voltar ao Dashboard
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Desktop Content - Hidden on mobile */}
          <div className="hidden md:flex md:flex-col md:flex-1 min-h-0">
            {/* Desktop Header */}
            <div
              className="px-8 lg:px-12 py-6 border-b border-gray-200"
              style={{ background: "#fff" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#1A2B5F",
                    }}
                  >
                    {title}
                  </h1>
                  {subtitle && (
                    <p
                      style={{
                        fontSize: 14,
                        color: "#6B7A99",
                        fontWeight: 400,
                        marginTop: 4,
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                {headerRight}
              </div>
            </div>

            {/* Desktop Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar px-8 lg:px-12 py-8 pb-20">
              <div className="max-w-5xl mx-auto">{children}</div>
            </div>
          </div>

          {/* Mobile Version - Hidden on desktop */}
          <div
            className="md:hidden flex flex-col flex-1 min-h-screen"
            style={{
              fontFamily: "'Poppins', sans-serif",
              background: "#F4F7FF",
            }}
          >
            {/* Header */}
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{
                background:
                  "linear-gradient(150deg, #003884 0%, #0052CC 60%, #0065FF 100%)",
                paddingTop: 56,
                paddingBottom: 24,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            >
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: "#fff" }}
              />
              <div
                className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full opacity-8"
                style={{ background: "#fff" }}
              />

              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 mb-4 relative z-10"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.18)" }}
                >
                  <ArrowLeft size={16} color="white" />
                </div>
                <span
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 400,
                  }}
                >
                  Configurações
                </span>
              </button>

              <div className="flex items-end justify-between relative z-10">
                <div>
                  <h1
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </h1>
                  {subtitle && (
                    <p
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 400,
                        marginTop: 3,
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                {headerRight}
              </div>
            </div>

            {/* Scrollable content */}
            <div
              className="flex-1 overflow-y-auto hide-scrollbar px-5 py-5"
              style={{
                paddingBottom: 32,
                paddingTop: noPadding ? 0 : 20,
                paddingLeft: noPadding ? 0 : 20,
                paddingRight: noPadding ? 0 : 20,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}

// ─── Reusable sub-components ────────────────────────────────────────────────

export function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      {title && (
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: "#6B7A99",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 10,
            paddingLeft: 4,
          }}
        >
          {title}
        </p>
      )}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1.5px solid #DBEAFE",
          boxShadow: "0 2px 12px rgba(0,82,204,0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SettingsRow({
  icon,
  iconBg,
  label,
  sublabel,
  right,
  onClick,
  danger,
  noBorder,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  noBorder?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 md:px-5 md:py-4 text-left transition-all duration-150 hover:bg-gray-50"
      style={{
        background: "none",
        border: "none",
        borderBottom: noBorder ? "none" : "1px solid #EBF3FF",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {icon && (
        <div
          className="w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg || "#EBF3FF" }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: danger ? "#FF5630" : "#1A2B5F",
            lineHeight: 1.3,
          }}
        >
          {label}
        </p>
        {sublabel && (
          <p
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 11,
              fontWeight: 400,
              color: "#6B7A99",
              marginTop: 1,
            }}
          >
            {sublabel}
          </p>
        )}
      </div>
      {right}
    </button>
  );
}

export function Toggle({
  value,
  onChange,
  color = "#0052CC",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 transition-all duration-300"
      style={{
        width: 46,
        height: 26,
        borderRadius: 13,
        background: value ? color : "#D1D9E8",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <div
        className="absolute top-1 transition-all duration-300 rounded-full"
        style={{
          width: 18,
          height: 18,
          background: "#fff",
          left: value ? 25 : 3,
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        }}
      />
    </button>
  );
}
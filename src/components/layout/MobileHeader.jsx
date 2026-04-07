// src/components/layout/MobileHeader.jsx
// Header fijo en mobile (< 768px)
// — Logo centrado
// — Avatar del usuario (izquierda) → /profile
// — Campana con badge de alertas no leídas (derecha) → /alerts
// CRÍTICO: paddingTop con env(safe-area-inset-top) para respetar el status bar
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../app/slices/authSlice.js";
import Logo from "../ui/logo.jsx";

const BellIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 2a6 6 0 0 1 6 6v3l1.5 2.5H2.5L4 11V8a6 6 0 0 1 6-6Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M8 15.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const MobileHeader = ({ unreadAlerts = 0 }) => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const initial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 font-[DM_Sans]"
      style={{
        height: "calc(3.5rem + env(safe-area-inset-top))",
        paddingTop: "env(safe-area-inset-top)",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        zIndex: 50,
      }}
    >
      {/* Avatar → /profile */}
      <button
        onClick={() => navigate("/profile")}
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ background: "var(--accent)" }}
        aria-label="Mi perfil"
      >
        {initial}
      </button>

      {/* Logo centrado */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Logo collapsed={false} />
      </div>

      {/* Campana → /alerts */}
      <button
        onClick={() => navigate("/alerts")}
        className="relative flex items-center justify-center w-9 h-9 flex-shrink-0"
        style={{ color: "var(--muted)" }}
        aria-label="Alertas"
      >
        <BellIcon />
        {unreadAlerts > 0 && (
          <span
            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "var(--critical)" }}
          >
            {unreadAlerts > 9 ? "9+" : unreadAlerts}
          </span>
        )}
      </button>
    </header>
  );
};

export default MobileHeader;

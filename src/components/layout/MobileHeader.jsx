// src/components/layout/MobileHeader.jsx
// Header fijo en mobile (< 768px)
// — Logo centrado
// — Avatar del usuario (izquierda) → /profile
// — Globe (idioma) + Campana con badge de alertas no leídas (derecha) → /alerts
// CRÍTICO: paddingTop con env(safe-area-inset-top) para respetar el status bar
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../app/slices/authSlice.js";
import { setLanguage } from "../../app/slices/uiSlice.js";
import { Globe } from "lucide-react";
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
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const activeLang = useSelector((state) => state.ui.language);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const initial = user?.name?.[0]?.toUpperCase() || "U";

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

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
        <Logo variant="full" />
      </div>

      {/* Globe (idioma) + Campana → /alerts */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Language selector */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center justify-center w-9 h-9"
            style={{ color: "var(--muted)" }}
            aria-label="Seleccionar idioma"
          >
            <Globe size={18} strokeWidth={1.5} />
          </button>
          {langOpen && (
            <div
              className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                zIndex: 100,
                minWidth: "72px",
              }}
            >
              {["es", "en", "ca"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => { dispatch(setLanguage(lang)); setLangOpen(false); }}
                  className="w-full px-4 py-2 text-xs font-semibold text-left transition-colors duration-150"
                  style={{
                    color: activeLang === lang ? "var(--accent)" : "var(--muted)",
                    background: activeLang === lang ? "rgba(108, 99, 255, 0.12)" : "transparent",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bell → /alerts */}
        <button
          onClick={() => navigate("/alerts")}
          className="relative flex items-center justify-center w-9 h-9"
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
      </div>
    </header>
  );
};

export default MobileHeader;

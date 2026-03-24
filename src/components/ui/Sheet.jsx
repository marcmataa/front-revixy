// Panel deslizante desde la derecha — usado por SimulationSheet
// ESC cierra el Sheet — accesibilidad crítica
// Body scroll bloqueado cuando está abierto
// z-index: var(--z-sheet) = 50
// title y closeLabel deben venir de useT() en el componente padre

import { useEffect } from "react";

const Sheet = ({ isOpen, onClose, title, closeLabel = "Cerrar", children }) => {
  // Cierre con tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Bloqueo de scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay — role="presentation" para accesibilidad correcta */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: "var(--z-sheet)" }}
        onClick={onClose}
        role="presentation"
      />

      {/* Panel deslizante */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col"
        style={{ zIndex: "calc(var(--z-sheet) + 1)" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text)] font-[Syne]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1.5 rounded-lg hover:bg-[var(--surface2)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] outline-none"
            aria-label={closeLabel}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
};

export default Sheet;

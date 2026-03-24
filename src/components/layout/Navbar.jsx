// Título de página desde useT() mapeado por ruta — NUNCA hardcodeado
// Fallback: t.common.appName — NUNCA hardcodear "REVIXY"
// Punto verde + dominio Shopify cuando la tienda está conectada

import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentStore } from "../../app/slices/storeSlice.js";
import { useT } from "../../hooks/useT.js";

const Navbar = () => {
  const location = useLocation();
  const currentStore = useSelector(selectCurrentStore);
  const t = useT();

  const pageTitles = {
    "/dashboard": t.dashboard.title,
    "/alerts": t.alerts.title,
    "/chat": t.chat.title,
    "/settings": t.settings.title,
  };

  const pageTitle = pageTitles[location.pathname] ?? t.common.appName;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
      <h1 className="text-lg font-semibold text-[var(--text)] font-[Syne]">{pageTitle}</h1>

      {currentStore?.shopifyDomain && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--success)]" aria-hidden="true" />
          <span className="text-sm text-[var(--muted)] font-[DM_Sans]">{currentStore.shopifyDomain}</span>
        </div>
      )}
    </header>
  );
};

export default Navbar;

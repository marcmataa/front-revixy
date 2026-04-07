// src/components/layout/Layout.jsx
// Wrapper principal de todas las páginas protegidas
//
// Breakpoints:
//   Desktop (≥ 1024px): Sidebar expandible + Navbar en top + main scrollable
//   Tablet  (768–1023px): Sidebar colapsado (solo iconos, w-16) + Navbar
//   Mobile  (< 768px): Sin Sidebar, sin Navbar. MobileHeader fijo arriba + BottomNav fijo abajo
//
// Z-index reference:
//   MobileHeader / BottomNav: 50
//   Sheet / Modal:             100  ← debe renderizar sobre la nav
//
// padding del main en mobile:
//   top:    3.5rem + env(safe-area-inset-top)      → altura MobileHeader
//   bottom: 4rem   + env(safe-area-inset-bottom)   → altura BottomNav + notch

import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import MobileHeader from "./MobileHeader.jsx";
import BottomNav from "./BottomNav.jsx";
import { useIsMobile, useIsTablet } from "../../hooks/useMediaQuery.js";

const Layout = ({ children }) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // En tablet el sidebar se muestra pero colapsado (solo iconos)
  const sidebarForceCollapsed = isTablet;

  if (isMobile) {
    return (
      <div className="flex flex-col" style={{ minHeight: "100dvh", background: "var(--bg)" }}>
        {/* Header fijo en top */}
        <MobileHeader />

        {/* Contenido principal — padding compensa header y bottom nav */}
        <main
          className="flex-1 overflow-y-auto p-4"
          role="main"
          style={{
            paddingTop: "calc(3.5rem + env(safe-area-inset-top))",
            paddingBottom: "calc(4rem + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </main>

        {/* Nav inferior fija */}
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Sidebar: colapsado en tablet, expandible en desktop */}
      <Sidebar forceCollapsed={sidebarForceCollapsed} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

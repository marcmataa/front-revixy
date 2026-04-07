// src/hooks/useMediaQuery.js
// Hook reactivo para media queries — se actualiza en tiempo real sin polling
import { useState, useEffect } from "react";

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
};

// Atajos para los breakpoints del diseño
// Mobile: < 768px → sin sidebar, con MobileHeader + BottomNav
// Tablet: 768–1023px → sidebar colapsado (solo iconos)
// Desktop: ≥ 1024px → sidebar expandible
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

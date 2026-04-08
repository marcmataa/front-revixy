import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resetea el scroll al tope en cada cambio de ruta
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

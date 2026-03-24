// src/hooks/useT.js
// Hook para acceder a las traducciones en componentes React
// Lee store.language de Redux — si no hay store, usa español por defecto
// Nunca lanzar error — fallback a español siempre
import { useSelector } from "react-redux";
import { getT } from "../i18n/index.js";

export const useT = () => {
  // Fallback a "es" si store.current es null (durante onboarding o sin tienda)
  const language = useSelector(
    (state) => state.store?.current?.language || "es"
  );
  return getT(language);
};

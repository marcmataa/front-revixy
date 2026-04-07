// src/hooks/useT.js
// Hook para acceder a las traducciones en componentes React
// Prioridad: idioma del store autenticado > uiSlice (Settings) > español
// Nunca lanzar error — fallback a español siempre
import { useSelector } from "react-redux";
import { getT } from "../i18n/index.js";

export const useT = () => {
  // Idioma del usuario autenticado (null si no hay tienda conectada)
  const storeLanguage = useSelector(
    (state) => state.store?.current?.language || null
  );

  // Idioma global de la app — se setea desde Settings o desde la landing page
  // Persiste en localStorage con clave 'revixy_language'
  const uiLanguage = useSelector((state) => state.ui?.language || "es");

  // Los usuarios autenticados con tienda usan el idioma de su tienda (backend)
  // El resto usa el uiSlice (Landing selector, Settings, browser default)
  const language = storeLanguage || uiLanguage;
  return getT(language);
};

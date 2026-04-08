// src/hooks/useT.js
// Hook para acceder a las traducciones en componentes React
// SSOT: state.ui.language — inicializado desde localStorage, persiste entre navegaciones
// Nunca lanzar error — fallback a español siempre
import { useSelector } from "react-redux";
import { getT } from "../i18n/index.js";

export const useT = () => {
  // Idioma global de la app — controlado por el usuario (Landing, Sidebar, Settings)
  // Persiste en localStorage con clave 'revixy_language' via uiSlice.setLanguage
  // detectLanguage() en uiSlice lee localStorage al arrancar → persiste entre reloads
  const language = useSelector((state) => state.ui?.language || "es");
  return getT(language);
};

// src/hooks/useT.js
// Hook para acceder a las traducciones en componentes React
// Prioridad: idioma del store autenticado > idioma de la landing (localStorage) > español
// Nunca lanzar error — fallback a español siempre
import { useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import { getT } from "../i18n/index.js";
import { landingLanguageStore } from "../i18n/landingLanguageStore.js";

export const useT = () => {
  // Idioma del usuario autenticado (null si no hay tienda conectada)
  const storeLanguage = useSelector(
    (state) => state.store?.current?.language || null
  );

  // Idioma de la landing page — persiste en localStorage, reactivo via useSyncExternalStore
  const landingLanguage = useSyncExternalStore(
    landingLanguageStore.subscribe,
    landingLanguageStore.getLanguage
  );

  // Los usuarios autenticados usan el idioma de su tienda; el resto usa el de la landing
  const language = storeLanguage || landingLanguage;
  return getT(language);
};

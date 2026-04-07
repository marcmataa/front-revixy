// src/i18n/landingLanguageStore.js
// Mini-store para el idioma de la landing page (usuarios no autenticados)
// Persiste en localStorage y notifica a los suscriptores en tiempo real
// Compatible con useSyncExternalStore de React 18+

// Misma clave que uiSlice — Landing y App comparten estado de idioma sin sync extra
const STORAGE_KEY = "revixy_language";
const DEFAULT_LANG = "es";
const ALLOWED = ["es", "en", "ca"];

// Conjunto de listeners registrados por useSyncExternalStore
let listeners = new Set();

const getLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return ALLOWED.includes(stored) ? stored : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
};

const setLanguage = (lang) => {
  const normalized = typeof lang === "string" ? lang.trim().toLowerCase() : DEFAULT_LANG;
  const safe = ALLOWED.includes(normalized) ? normalized : DEFAULT_LANG;

  try {
    localStorage.setItem(STORAGE_KEY, safe);
  } catch {
    // Si localStorage no está disponible, seguimos sin persistir
  }

  // Notificar a todos los suscriptores para que React re-renderice
  listeners.forEach((listener) => listener());
};

// subscribe recibe un callback y devuelve el cleanup — contrato de useSyncExternalStore
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const landingLanguageStore = { getLanguage, setLanguage, subscribe };

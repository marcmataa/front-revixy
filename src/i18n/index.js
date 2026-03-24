// src/i18n/index.js
// Sistema de i18n del frontend — fuente única de verdad para textos de UI
// Debe ser consistente con el backend (store.language es la fuente de verdad)
import es from "./es.js";
import en from "./en.js";
import ca from "./ca.js";

const translations = { es, en, ca };

// Proxy con fallback a español para claves faltantes
// CRÍTICO: si una clave no existe en el idioma seleccionado → busca en español
// Esto previene que el usuario vea "dashboard.kpis.profit" en pantalla
// en lugar del texto real cuando falta una traducción
const withFallback = (target, fallback) => {
  return new Proxy(target, {
    get(obj, key) {
      const value = obj[key];
      const fallbackValue = fallback[key];

      // Si el valor es un objeto anidado → aplicamos Proxy recursivamente
      if (
        typeof fallbackValue === "object" &&
        fallbackValue !== null &&
        !Array.isArray(fallbackValue)
      ) {
        return withFallback(value || {}, fallbackValue);
      }

      // Si la clave no existe en el idioma seleccionado → usamos español como fallback
      return value !== undefined ? value : fallbackValue;
    },
  });
};

// 5 niveles de protección — igual que el backend getT()
// Nunca lanzar error desde aquí — siempre devolver fallback en español
export const getT = (language) => {
  try {
    const lang =
      typeof language === "string" && language.trim().length > 0
        ? language.trim().toLowerCase()
        : "es";
    const allowed = ["es", "en", "ca"];
    const safe = allowed.includes(lang) ? lang : "es";
    const selected = translations[safe] ?? translations.es;

    // Para español no necesitamos Proxy — es el propio fallback
    if (safe === "es") return selected;

    // Para otros idiomas aplicamos Proxy con fallback a español
    // Así cualquier clave faltante en en.js o ca.js muestra el texto español
    return withFallback(selected, translations.es);
  } catch {
    // Si ocurre cualquier error inesperado, devolvemos español siempre
    return translations.es;
  }
};

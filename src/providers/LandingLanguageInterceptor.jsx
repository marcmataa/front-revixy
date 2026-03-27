// src/providers/LandingLanguageInterceptor.jsx
// Intercepta los clics en botones .lang-btn de la landing page
// y actualiza el idioma global en landingLanguageStore sin tocar LandingPage.jsx
//
// Estrategia: event delegation a nivel document
// Los botones del Footer tienen la clase CSS "lang-btn" — usamos eso como selector estable
// e.target.closest(".lang-btn") es robusto ante elementos hijos dentro del botón
import { useEffect } from "react";
import { landingLanguageStore } from "../i18n/landingLanguageStore.js";

export default function LandingLanguageInterceptor() {
  useEffect(() => {
    const handleClick = (e) => {
      const btn = e.target.closest(".lang-btn");
      if (!btn) return;

      // El botón contiene el código del idioma: "ES", "EN" o "CA"
      const lang = btn.textContent.trim().toLowerCase();
      landingLanguageStore.setLanguage(lang);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Componente invisible — sólo registra el listener
  return null;
}

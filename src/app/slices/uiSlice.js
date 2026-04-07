// src/app/slices/uiSlice.js
// Estado UI global: idioma de la app y sidebar
// El idioma se persiste en localStorage con la misma clave que usa la landing page
// para que Landing y App siempre estén sincronizados sin mecanismos extra
import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "revixy_language";
const ALLOWED = ["es", "en", "ca"];

// Detecta el idioma inicial en este orden de prioridad:
// 1. localStorage (el usuario eligió explícitamente un idioma en Landing o Settings)
// 2. navigator.language (idioma del navegador)
// 3. 'es' por defecto
const detectLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ALLOWED.includes(stored)) return stored;

    const browserLang = navigator.language?.slice(0, 2).toLowerCase();
    if (ALLOWED.includes(browserLang)) return browserLang;
  } catch {
    // Si localStorage no está disponible, usamos español
  }
  return "es";
};

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    language: detectLanguage(),
    sidebarCollapsed: false,
  },
  reducers: {
    // Persiste el idioma en localStorage para sincronizar Landing ↔ App
    setLanguage: (state, action) => {
      const lang = action.payload;
      const safe = ALLOWED.includes(lang) ? lang : "es";
      state.language = safe;
      try {
        localStorage.setItem(STORAGE_KEY, safe);
      } catch {
        // Si localStorage no está disponible, seguimos sin persistir
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { setLanguage, toggleSidebar, setSidebarCollapsed } = uiSlice.actions;
export default uiSlice.reducer;

// Selectores
export const selectLanguage = (state) => state.ui.language;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;

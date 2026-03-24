// src/utils/constants.js
// Constantes globales — nunca hardcodear estos valores en componentes

// Estilos por severidad — usados en AlertCard, AlertFeed y Badge
export const SEVERITY_STYLES = {
  CRITICAL: {
    border: "border-l-4 border-[var(--critical)]",
    badge: "bg-red-500/20 text-red-400",
    icon: "🔴",
  },
  WARNING: {
    border: "border-l-4 border-[var(--warning)]",
    badge: "bg-orange-500/20 text-orange-400",
    icon: "🟠",
  },
  OPPORTUNITY: {
    border: "border-l-4 border-[var(--success)]",
    badge: "bg-green-500/20 text-green-400",
    icon: "🟢",
  },
};

// Colores de gráficas — siempre usar estas constantes en Recharts
export const CHART_COLORS = {
  profit: "#34D399",
  profitNegative: "#F87171",
  revenue: "#6C63FF",
  adSpend: "#FB923C",
  roas: "#A78BFA",
  breakEven: "#6B6B80",
  grid: "rgba(255,255,255,0.05)",
};

// Tipos de acción para el simulador — deben coincidir con el backend
export const SIMULATION_ACTIONS = {
  PAUSE_CAMPAIGN: "PAUSE_CAMPAIGN",
  SCALE_BUDGET: "SCALE_BUDGET",
  RESTOCK: "RESTOCK",
};

// Idiomas soportados — deben coincidir con el backend
export const SUPPORTED_LANGUAGES = ["es", "en", "ca"];
export const DEFAULT_LANGUAGE = "es";

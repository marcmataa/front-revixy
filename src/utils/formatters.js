// src/utils/formatters.js
// Archivo único de formateo — TODOS los componentes importan desde aquí
// NUNCA crear archivos separados como formatCurrency.js o formatDate.js

// Formatea céntimos a moneda con formato europeo
// IMPORTANTE: recibe CÉNTIMOS del backend → divide por 100 internamente
export const formatCurrency = (cents, currency = "EUR") => {
  if (cents === null || cents === undefined) return "N/A";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
};

// Formatea fecha ISO a string legible — "23 mar"
export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateString));
};

// Formatea ratio ROAS — NO es céntimos, nunca dividir
export const formatROAS = (roas) =>
  !roas ? "N/A" : `${Number(roas).toFixed(2)}x`;

// Formatea porcentaje — NO es céntimos, nunca dividir
export const formatPercent = (value) =>
  value == null ? "N/A" : `${Number(value).toFixed(1)}%`;

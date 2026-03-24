// src/api/stats.api.js
// Nota: estos endpoints son llamados principalmente via RTK Query (useStats hook)
// Esta capa directa existe para llamadas manuales fuera del contexto de RTK Query
import client from "./client.js";

export const statsApiDirect = {
  // Retorna KPIs + últimos 14 días — todos los valores monetarios en CÉNTIMOS
  getDashboard: (storeId) => client.get(`/stats/dashboard?storeId=${storeId}`),
  // Retorna array de alertas — severidad: CRITICAL | WARNING | OPPORTUNITY
  getAlerts: (storeId) => client.get(`/stats/alerts?storeId=${storeId}`),
};

// src/app/slices/statsSlice.js
// RTK Query para DailyStats y Alerts — con polling automático cada 5 minutos
// NUNCA duplicar estos datos en un slice regular — RTK Query maneja caché e invalidación
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/axiosBaseQuery.js";

export const statsApi = createApi({
  reducerPath: "statsApi",
  // Usamos axiosBaseQuery para heredar interceptores de auth automáticamente
  // Sin esto las peticiones no llevarían el Bearer token y fallarían con 401
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Stats", "Alerts"],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (storeId) => ({ url: `/stats/dashboard?storeId=${storeId}` }),
      // Refresca automáticamente cada 5 minutos sin acción del usuario
      pollingInterval: 5 * 60 * 1000,
      // Cache por storeId — evita mezclar datos de diferentes tiendas
      providesTags: (result, error, storeId) => [{ type: "Stats", id: storeId }],
    }),
    getAlerts: builder.query({
      query: (storeId) => ({ url: `/stats/alerts?storeId=${storeId}` }),
      pollingInterval: 5 * 60 * 1000,
      // Cache por storeId — invalidación precisa sin refetch innecesario
      providesTags: (result, error, storeId) => [{ type: "Alerts", id: storeId }],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetAlertsQuery } = statsApi;

// Para invalidar manualmente tras mutations que afecten stats o alertas
// Ejemplo: dispatch(statsApi.util.invalidateTags([{ type: "Stats", id: storeId }]))
// Usar tras: updateStoreSettings, runSimulation ejecutada

// src/hooks/useStats.js
// Hook que encapsula RTK Query para DailyStats y Alerts
// Centraliza el acceso a datos del dashboard desde cualquier componente
// RTK Query maneja polling, caché e invalidación automáticamente
import { useSelector } from "react-redux";
import {
  useGetDashboardStatsQuery,
  useGetAlertsQuery,
} from "../app/slices/statsSlice.js";

export const useStats = () => {
  // Obtenemos storeId y currency del slice de store
  const storeId = useSelector((state) => state.store?.current?._id ?? null);
  const currency = useSelector(
    (state) => state.store?.current?.currency || "EUR"
  );

  const {
    data: dashboardData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery(storeId, {
    skip: !storeId, // no iniciar polling si no hay storeId disponible
  });

  const {
    data: alertsData,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useGetAlertsQuery(storeId, {
    skip: !storeId,
  });

  return {
    // Los valores monetarios en dailyStats están en CÉNTIMOS — dividir al mostrar
    dailyStats: dashboardData?.data?.dailyStats ?? [],
    kpis: dashboardData?.data?.kpis ?? null,
    alerts: alertsData?.data?.alerts ?? [],
    currency,
    storeId,
    loading: statsLoading || alertsLoading,
    error: statsError,
    refetch: () => {
      refetchStats();
      refetchAlerts();
    },
  };
};

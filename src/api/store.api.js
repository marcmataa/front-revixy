// src/api/store.api.js
import client from "./client.js";

export const storeApi = {
  // Obtiene la tienda del usuario autenticado
  getMyStore: () => client.get("/store"),
  // Actualiza configuración de la tienda
  updateSettings: (settings) => client.post("/stores/settings", settings),
  // Actualiza objetivos mensuales — targetRevenue y targetAdSpend en CÉNTIMOS
  updateMonthlyGoals: (goals) => client.patch("/store/goals", goals),
  // Inicia flujo OAuth con Shopify — el backend devuelve oauthUrl para redirigir
  connectShopify: (shop) =>
    client.get("/integrations/shopify/connect", { params: { shop } }),
  // Inicia flujo OAuth con Meta Ads — el backend redirige a Meta
  connectMeta: () => client.get("/integrations/meta/connect"),
  // Obtiene el estado de conexión de Shopify y Meta para el store actual
  getIntegrationStatus: () => client.get("/integrations/status"),
  // Desconecta Shopify — limpia el token y marca el store como REAUTH_REQUIRED
  disconnectShopify: () => client.delete("/integrations/shopify"),
};

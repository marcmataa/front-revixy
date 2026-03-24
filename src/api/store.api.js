// src/api/store.api.js
import client from "./client.js";

export const storeApi = {
  // Obtiene la tienda del usuario autenticado
  getMyStore: () => client.get("/store"),
  // Actualiza configuración de la tienda
  updateSettings: (settings) => client.patch("/store/settings", settings),
  // Actualiza objetivos mensuales — targetRevenue y targetAdSpend en CÉNTIMOS
  updateMonthlyGoals: (goals) => client.patch("/store/goals", goals),
  // Inicia flujo OAuth con Shopify — el backend redirige a Shopify
  connectShopify: (shop) =>
    client.post("/integrations/shopify/connect", { shop }),
  // Inicia flujo OAuth con Meta Ads — el backend redirige a Meta
  connectMeta: () => client.get("/integrations/meta/connect"),
};

// src/api/axiosBaseQuery.js
// Wrapper para que RTK Query use nuestra instancia de Axios con interceptores.
// Sin esto, las peticiones de RTK Query no llevarán el Bearer token y fallarán.
// También previene el hydration loop — si el 401 persiste tras el refresh,
// despacha sessionExpired para detener el polling inmediatamente.
import client from "./client.js";

export const axiosBaseQuery =
  () =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await client({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      // Si tras el refresh el 401 persiste, cortamos el ciclo de polling
      // Esto evita que RTK Query siga reintentando con sesión expirada
      if (error.response?.status === 401) {
        const { store } = await import("../app/store.js");
        store.dispatch({ type: "auth/sessionExpired" });
      }
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || error.message,
        },
      };
    }
  };

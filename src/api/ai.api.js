// src/api/ai.api.js
import axios from "axios";
import client from "./client.js";

// Cliente específico para IA — timeout extendido a 60 segundos
// CRÍTICO: NUNCA usar el client estándar (15s) para llamadas de IA
// Los modelos de lenguaje pueden tardar en generar respuestas completas
// Con el client estándar el usuario verá error de timeout aunque la IA esté trabajando
const aiClient = axios.create({
  ...client.defaults,
  timeout: 60000,
});

// Copiamos los interceptores EXPLÍCITAMENTE — nunca asignar referencias directas
// Los interceptores de Axios son específicos de cada instancia
// Si solo asignamos la referencia, los cambios futuros en client no se propagarían a aiClient
aiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

aiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // _retried previene bucles infinitos — solo reintentamos una vez por request
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return aiClient(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        const { store } = await import("../app/store.js");
        store.dispatch({ type: "auth/sessionExpired" });
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const aiApi = {
  // Envía mensaje al chat — sessionId mantiene contexto entre mensajes del mismo usuario
  chat: ({ storeId, message, sessionId }) =>
    aiClient.post(`/ai/chat?storeId=${storeId}`, { message, sessionId }),
  // Solicita insight automático basado en los datos actuales de la tienda
  insight: (storeId) => aiClient.post(`/ai/insight?storeId=${storeId}`),
  // Simula impacto financiero de una acción
  // signal viene de simulationSlice — cuando el usuario cierra el Sheet,
  // el thunk runSimulation aborta la petición para evitar que respuestas tardías
  // sobreescriban el estado después de que el panel se ha cerrado
  simulate: ({ storeId, action }, { signal } = {}) =>
    aiClient.post(`/ai/simulate?storeId=${storeId}`, { action }, { signal }),
};

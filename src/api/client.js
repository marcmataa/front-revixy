// src/api/client.js
// Cliente Axios base con interceptores de auth y refresco automático de token
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // necesario para enviar la cookie httpOnly del refresh token
  timeout: 15000, // 15 segundos para operaciones estándar
  headers: { "Content-Type": "application/json" },
});

// Inyectamos el Bearer token en cada petición saliente
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresco automático de token al recibir 401
client.interceptors.response.use(
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
        return client(originalRequest);
      } catch {
        // Si el refresh también falla, reseteamos todo el estado de Redux y redirigimos
        localStorage.removeItem("accessToken");
        // Importamos store de forma dinámica para evitar dependencia circular
        const { store } = await import("../app/store.js");
        store.dispatch({ type: "auth/sessionExpired" });
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;

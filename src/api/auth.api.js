// src/api/auth.api.js
import client from "./client.js";

export const authApi = {
  register: (userData) => client.post("/auth/register", userData),
  login: (credentials) => client.post("/auth/login", credentials),
  refresh: () => client.post("/auth/refresh"),
  logout: () => client.post("/auth/logout"),
  // Usado por AuthGuard para validar token en servidor — nunca confiar solo en localStorage
  getMe: () => client.get("/auth/me"),
  // Intercambia la cookie oauth_handoff por el accessToken tras Google OAuth
  // El backend limpia la cookie inmediatamente tras este intercambio
  getOAuthToken: () => client.get("/auth/token"),
};

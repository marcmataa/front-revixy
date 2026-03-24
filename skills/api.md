# SKILL: API LAYER ARCHITECT (Axios + RTK Query + Security)

## 1. ROLE & RESPONSIBILITY

You are a Senior Frontend Security Engineer and API Architect.
Your mission: build a secure, resilient, and consistent HTTP communication layer for REVIXY.
Every API call must be authenticated, sanitized, error-handled, and never expose sensitive data.

---

## 2. SECURITY PRINCIPLES (NON-NEGOTIABLE)

### Token Security

- Access token stored in `localStorage` — short-lived (7 days)
- Refresh token stored in `httpOnly` cookie — never accessible from JS
- Never log tokens, never expose tokens in URLs, never send tokens in query params
- On 401 → auto-refresh once → if fails → `auth/sessionExpired` → redirect to login

### Request Security

- Never send raw user input to the API — always validate with Zod first
  import { z } from "zod";

const loginSchema = z.object({
email: z.string().email(),
password: z.string().min(6),
});

export const login = (data) => {
loginSchema.parse(data);
return client.post("/auth/login", data);
};

- Never include sensitive fields in GET query params (use POST with body)
- Always use `withCredentials: true` for cookie-based auth
- Never hardcode API URLs — always `import.meta.env.VITE_API_URL`

### Response Security

- Never expose raw 5xx error messages to the user
- Never store full API responses in Redux — extract only what the UI needs
- Sanitize error messages before showing them in toasts
- If response contains unexpected fields → ignore them, never render unknown data

### CORS & Headers

- The backend handles CORS — never try to bypass it from the frontend
- Never add custom headers that could trigger CORS preflight unexpectedly

---

## 3. BASE CLIENT (MANDATORY)

```js
// src/api/client.js
import axios from "axios";
import { store } from "../app/store.js";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // necesario para enviar la cookie httpOnly del refresh token
  timeout: 15000, // timeout de 15 segundos — evita requests colgados
  headers: {
    "Content-Type": "application/json",
  },
});

// Inyectamos el Bearer token en cada petición saliente
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Manejo centralizado de respuestas y errores
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Intentamos refrescar el token solo una vez — evitamos bucles infinitos
    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch {
        // Si el refresh falla, reseteamos todo el estado de Redux
        localStorage.removeItem("accessToken");
        store.dispatch({ type: "auth/sessionExpired" });
        return Promise.reject(error);
      }
    }

    // Para cualquier otro error, rechazamos con el error original
    return Promise.reject(error);
  },
);

export default client;
```

---

## 4. AXIOS BASE QUERY FOR RTK QUERY (MANDATORY)

```js
// src/api/axiosBaseQuery.js
// Wrapper para que RTK Query use nuestra instancia de Axios con interceptores.
// Sin esto, las peticiones de RTK Query no llevarán el Bearer token y fallarán.
import client from "./client.js";
import { store } from "../app/store.js";

export const axiosBaseQuery =
  () =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await client({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      // Si tras el intento de refresh el 401 persiste, cortamos el ciclo de polling
      // Esto evita que RTK Query siga reintentando indefinidamente con sesión expirada
      if (error.response?.status === 401) {
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
```

---

## 5. AUTH API (MANDATORY)

```js
// src/api/auth.api.js
import client from "./client.js";

export const authApi = {
  // Registro de nuevo usuario
  register: (userData) => client.post("/auth/register", userData),

  // Login con email y contraseña
  login: (credentials) => client.post("/auth/login", credentials),

  // Refresco de access token usando la cookie httpOnly
  refresh: () => client.post("/auth/refresh"),

  // Logout — limpia la cookie del servidor
  logout: () => client.post("/auth/logout"),

  // Obtiene el usuario autenticado — usado por AuthGuard para validar token
  getMe: () => client.get("/auth/me"),

  // Intercambia la cookie oauth_handoff por el accessToken tras Google OAuth
  getOAuthToken: () => client.get("/auth/token"),
};
```

---

## 6. STORE API (MANDATORY)

```js
// src/api/store.api.js
import client from "./client.js";

export const storeApi = {
  // Obtiene la tienda del usuario autenticado
  getMyStore: () => client.get("/store"),

  // Actualiza la configuración de la tienda
  updateSettings: (settings) => client.patch("/store/settings", settings),

  // Actualiza los objetivos mensuales
  updateMonthlyGoals: (goals) => client.patch("/store/goals", goals),

  // Calcula el break-even ROAS basado en el margen
  calculateBreakEven: (marginPercent) =>
    client.post("/store/break-even", { marginPercent }),

  // Inicia el flujo de conexión con Shopify
  connectShopify: (shop) =>
    client.post("/integrations/shopify/connect", { shop }),

  // Inicia el flujo de conexión con Meta Ads
  connectMeta: () => client.get("/integrations/meta/connect"),
};
```

---

## 7. STATS API (MANDATORY)

```js
// src/api/stats.api.js
import client from "./client.js";

export const statsApi = {
  // Obtiene el resumen del dashboard (KPIs + últimos 14 días)
  getDashboard: (storeId) => client.get(`/stats/dashboard?storeId=${storeId}`),

  // Obtiene las alertas activas de la tienda
  getAlerts: (storeId) => client.get(`/stats/alerts?storeId=${storeId}`),

  // Obtiene los DailyStats de los últimos N días
  getDailyStats: (storeId, days = 14) =>
    client.get(`/stats/daily?storeId=${storeId}&days=${days}`),
};
```

---

## 8. AI API (MANDATORY)

```js
// src/api/ai.api.js
import axios from "axios";
import client from "./client.js";

// Cliente específico para llamadas de IA — timeout extendido a 60s
// Los modelos de lenguaje pueden tardar en generar respuestas completas
const aiClient = axios.create({
  ...client.defaults,
  timeout: 60000, // 60s — nunca usar el cliente estándar de 15s para IA
});

// Heredamos los interceptores del cliente base para mantener auth y refresh
client.interceptors.request.forEach((interceptor) => {
  aiClient.interceptors.request.use(
    interceptor.fulfilled,
    interceptor.rejected,
  );
});

client.interceptors.response.forEach((interceptor) => {
  aiClient.interceptors.response.use(
    interceptor.fulfilled,
    interceptor.rejected,
  );
});

export const aiApi = {
  // Envía un mensaje al chat de IA
  chat: ({ storeId, message, sessionId }) =>
    aiClient.post(`/ai/chat?storeId=${storeId}`, { message, sessionId }),

  // Solicita un insight automático basado en los datos actuales
  insight: (storeId) => aiClient.post(`/ai/insight?storeId=${storeId}`),

  // Simula el impacto de una acción — acepta signal para cancelación
  simulate: ({ storeId, action }, { signal } = {}) =>
    aiClient.post(`/ai/simulate?storeId=${storeId}`, { action }, { signal }),
};
```

---

## 9. ERROR HANDLING PATTERN (MANDATORY)

Every API call must follow this exact pattern:

```js
// Patrón estándar para llamadas API en thunks
const handleApiCall = async (apiCall, { rejectWithValue }) => {
  try {
    const { data } = await apiCall();
    return data.data; // siempre extraemos data.data — estructura del backend REVIXY
  } catch (error) {
    // 4xx → mostramos mensaje del servidor (validaciones, auth errors)
    // 5xx → mensaje genérico — nunca exponemos detalles internos al usuario
    const message =
      error.response?.status < 500
        ? error.response?.data?.error || "Error en la solicitud."
        : "Ha ocurrido un error inesperado. Inténtalo de nuevo.";
    return rejectWithValue(message);
  }
};
```

### Toast Rules (MANDATORY)

```js
// Toda mutación exitosa → toast de éxito
toast.success("Configuración guardada correctamente.");

// Todo error de API → toast de error con mensaje sanitizado
toast.error(error.payload || "Ha ocurrido un error. Inténtalo de nuevo.");

// Nunca swallow errors silenciosamente — siempre informar al usuario
```

---

## 10. REQUEST TIMEOUT & RETRY STRATEGY

```js
// Timeouts por tipo de operación
const TIMEOUTS = {
  default: 15000, // 15s para operaciones normales
  ai: 60000, // 60s para llamadas a la IA (pueden ser lentas)
  upload: 30000, // 30s para uploads
};

// Para llamadas de IA usar timeout extendido
const aiClient = axios.create({
  ...client.defaults,
  timeout: TIMEOUTS.ai,
});
```

No implementar retry automático para:

- Llamadas de IA (resultado puede variar)
- Mutaciones (POST/PUT/PATCH/DELETE) — riesgo de duplicación

Retry permitido solo para:

- GET de datos estables con RTK Query (automático)

// IMPORTANTE: aiApi usa aiClient (60s) — nunca client (15s)
// Si la IA tarda más de 15s en responder y usas client, el usuario
// verá un error de timeout aunque la IA esté trabajando correctamente.

---

## 11. API RESPONSE STRUCTURE

All REVIXY backend responses follow this structure:

```js
// Respuesta exitosa
{
  success: true,
  data: { ... }    // siempre acceder a data.data en el frontend
}

// Respuesta de error
{
  success: false,
  error: "Mensaje de error"    // acceder a error.response.data.error
}
```

Always extract `data.data` — never use `data` directly:

```js
// ✅ Correcto
const { data } = await authApi.login(credentials);
return data.data.user; // data.data es el payload real

// ❌ Incorrecto
const { data } = await authApi.login(credentials);
return data.user; // falta un nivel de anidación
```

---

## 12. CODING STANDARDS

- **Código:** En inglés. **Comentarios:** En español.
- **Cada dominio tiene su propio archivo** — `auth.api.js`, `store.api.js`, etc.
- **Nunca llamar axios directamente en componentes** — siempre usar la capa `api/`
- **Nunca hardcodear URLs** — siempre `import.meta.env.VITE_API_URL`
- **Siempre `withCredentials: true`** — necesario para cookies httpOnly
- **Siempre extraer `data.data`** — estructura estándar del backend REVIXY
- **Timeout explícito** — nunca requests sin timeout

---

## 13. ANTI-PATTERNS (PROHIBITED)

- NO llamadas axios directas en componentes o slices
- NO tokens en query params o URLs
- NO logs de tokens, passwords o datos sensibles
- NO exponer errores 5xx al usuario — mensaje genérico siempre
- NO requests sin timeout
- NO retry automático en mutaciones
- NO acceder a `data` sin extraer `data.data`
- NO URLs hardcodeadas
- NO ignorar errores silenciosamente — siempre toast
- NO enviar datos sin validación Zod previa
- NO fetch nativo en RTK Query — siempre `axiosBaseQuery`
- NO `_retried` flag omitido en el interceptor de refresh — causa bucles infinitos

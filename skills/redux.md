# SKILL: REDUX ARCHITECT (Redux Toolkit + RTK Query)

## 1. ROLE & RESPONSIBILITY
You are a Senior State Management Engineer specialized in Redux Toolkit for React SaaS applications.
Your mission: implement a predictable, type-safe, and performant state layer for REVIXY.
Every slice must be intentional — no unnecessary state, no duplicated state, no local state that belongs in Redux.

---

## 2. WHEN TO USE REDUX VS LOCAL STATE

### Use Redux for:
- Authentication state (`user`, `loading`, `error`, `isHydrating`)
- Current store data (`store.current`) — needed across multiple pages
- Simulation Sheet state (`isOpen`, `action`, `result`) — singleton accessible from anywhere
- UI state that affects multiple components simultaneously

### Use local state (`useState`) for:
- Form inputs (handled by React Hook Form)
- Toggle states local to a single component
- Temporary UI feedback (hover, focus)

### Use RTK Query for:
- `DailyStats` — auto-polling every 5 minutes with cache per storeId
- `Alerts` — auto-polling every 5 minutes with cache per storeId
- Any data that needs caching, deduplication, or background refresh

**NEVER put RTK Query data into a regular slice. Never duplicate server state in Redux.**

---

## 3. STORE STRUCTURE (MANDATORY)

```js
// src/app/store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import storeReducer from "./slices/storeSlice.js";
import simulationReducer from "./slices/simulationSlice.js";
import { statsApi } from "./slices/statsSlice.js";

const rootReducer = combineReducers({
  auth: authReducer,
  store: storeReducer,
  simulation: simulationReducer,
  [statsApi.reducerPath]: statsApi.reducer,
});

// Resetea TODO el estado cuando la sesión expira
// Evita que datos de la tienda anterior queden en memoria
const resettableReducer = (state, action) => {
  if (action.type === "auth/sessionExpired") {
    state = undefined;
  }
  return rootReducer(state, action);
};

// Middleware de logging — solo en desarrollo para trazabilidad de acciones Redux
const loggerMiddleware = (store) => (next) => (action) => {
  if (import.meta.env.DEV) {
    console.log("[REDUX]", action.type, action.payload ?? "");
  }
  return next(action);
};

export const store = configureStore({
  reducer: resettableReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(statsApi.middleware, loggerMiddleware),
});
```

---

## 4. AUTH SLICE (MANDATORY)

```js
// src/app/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api.js";

// Valida el token en el servidor al montar la app — nunca confiar solo en localStorage
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await authApi.getMe();
      return data.data.user;
    } catch {
      // Limpiamos TODO el estado de Redux al expirar la sesión
      localStorage.removeItem("accessToken");
      dispatch({ type: "auth/sessionExpired" });
      return rejectWithValue("Session expired");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem("accessToken", data.data.accessToken);
      return data.data.user;
    } catch (error) {
      // Sanitizamos errores — nunca exponemos info sensible del backend al usuario
      const message = error.response?.status < 500
        ? error.response?.data?.error
        : "Error al iniciar sesión. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authApi.register(userData);
      localStorage.setItem("accessToken", data.data.accessToken);
      return data.data.user;
    } catch (error) {
      const message = error.response?.status < 500
        ? error.response?.data?.error
        : "Error al registrarse. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await authApi.logout();
    } finally {
      // Limpiamos siempre — aunque falle el API
      localStorage.removeItem("accessToken");
      dispatch({ type: "auth/sessionExpired" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    // isHydrating: true mientras checkAuth está en curso al montar la app
    isHydrating: true,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isHydrating = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isHydrating = false;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isHydrating = false;
        state.loading = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.isHydrating = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectores memoizados con createSelector — evitan re-renders innecesarios
export const selectUser = createSelector(
  (state) => state.auth.user,
  (user) => user
);
export const selectAuthLoading = (state) => state.auth.loading;
export const selectIsHydrating = (state) => state.auth.isHydrating;
export const selectAuthError = (state) => state.auth.error;
```

---

## 5. STORE SLICE (MANDATORY)

```js
// src/app/slices/storeSlice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { storeApi } from "../../api/store.api.js";

export const fetchCurrentStore = createAsyncThunk(
  "store/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await storeApi.getMyStore();
      return data.data.store;
    } catch (error) {
      const message = error.response?.status < 500
        ? error.response?.data?.error
        : "Error al cargar la tienda. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

export const updateStoreSettings = createAsyncThunk(
  "store/updateSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const { data } = await storeApi.updateSettings(settings);
      return data.data.store;
    } catch (error) {
      const message = error.response?.status < 500
        ? error.response?.data?.error
        : "Error al actualizar la configuración. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState: {
    current: null, // null = sin tienda → OnboardingGuard redirige
    loading: false,
    error: null,
  },
  reducers: {
    clearStoreError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentStore.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentStore.rejected, (state, action) => {
        state.current = null;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStoreSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStoreSettings.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(updateStoreSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStoreError } = storeSlice.actions;
export default storeSlice.reducer;

// Selectores memoizados — evitan re-renders cuando otros campos de state cambian
export const selectCurrentStore = createSelector(
  (state) => state.store.current,
  (current) => current
);
export const selectStoreLoading = (state) => state.store.loading;
export const selectStoreId = createSelector(
  (state) => state.store.current,
  (current) => current?._id ?? null
);
export const selectStoreCurrency = createSelector(
  (state) => state.store.current,
  (current) => current?.currency || "EUR"
);
export const selectStoreLanguage = createSelector(
  (state) => state.store.current,
  (current) => current?.language || "es"
);
```

---

## 6. SIMULATION SLICE — SINGLETON SHEET (MANDATORY)

```js
// src/app/slices/simulationSlice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { aiApi } from "../../api/ai.api.js";

// AbortController para cancelar peticiones si el usuario cierra el Sheet rápido
export const runSimulation = createAsyncThunk(
  "simulation/run",
  async ({ storeId, action }, { signal, requestId, rejectWithValue }) => {
    try {
      // signal permite cancelar la petición si el thunk se aborta
      const { data } = await aiApi.simulate({ storeId, action }, { signal });
      return data.data;
    } catch (error) {
      // Si la petición fue cancelada (AbortError), no mostramos error
      if (error.name === "AbortError") return;
      // Sanitizamos errores de servidor — no exponemos detalles internos
      const message = error.response?.status < 500
        ? error.response?.data?.error
        : "Error al simular la acción. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  },
  {
    // Cancela la petición anterior si se lanza una nueva antes de que termine
    // Evita race conditions si el usuario hace click rápido en "Simular"
    condition: (_, { getState }) => {
      const { loading } = getState().simulation;
      if (loading) return false; // ignora el dispatch si ya hay una simulación en curso
    },
  }
);

const simulationSlice = createSlice({
  name: "simulation",
  initialState: {
    isOpen: false,
    action: null,    // { type: "PAUSE_CAMPAIGN", params: { campaignId: "123" } }
    result: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Abre el Sheet y guarda la acción a simular
    openSimulation: (state, action) => {
      state.isOpen = true;
      state.action = action.payload;
      state.result = null;
      state.error = null;
    },
    // Cierra el Sheet y limpia todo el estado de simulación
    closeSimulation: (state) => {
      state.isOpen = false;
      state.action = null;
      state.result = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSimulation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runSimulation.fulfilled, (state, action) => {
        if (!action.payload) return; // petición cancelada — no actualizamos estado
        state.result = action.payload;
        state.loading = false;
      })
      .addCase(runSimulation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { openSimulation, closeSimulation } = simulationSlice.actions;
export default simulationSlice.reducer;

// Selectores memoizados
export const selectSimulationIsOpen = (state) => state.simulation.isOpen;
export const selectSimulationAction = (state) => state.simulation.action;
export const selectSimulationResult = createSelector(
  (state) => state.simulation.result,
  (result) => result
);
export const selectSimulationLoading = (state) => state.simulation.loading;
export const selectSimulationError = (state) => state.simulation.error;
```

---

## 7. RTK QUERY — STATS API (MANDATORY)

```js
// src/app/slices/statsSlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/axiosBaseQuery.js";

export const statsApi = createApi({
  reducerPath: "statsApi",
  // Usamos axiosBaseQuery para heredar interceptores de auth automáticamente
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Stats", "Alerts"],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (storeId) => ({ url: `/stats/dashboard?storeId=${storeId}` }),
      // Refresca cada 5 minutos automáticamente sin acción del usuario
      pollingInterval: 5 * 60 * 1000,
      // Cache por storeId — evita mezclar datos de diferentes tiendas
      providesTags: (result, error, storeId) => [
        { type: "Stats", id: storeId },
      ],
    }),
    getAlerts: builder.query({
      query: (storeId) => ({ url: `/stats/alerts?storeId=${storeId}` }),
      pollingInterval: 5 * 60 * 1000,
      // Cache por storeId — invalidación precisa sin refetch innecesario
      providesTags: (result, error, storeId) => [
        { type: "Alerts", id: storeId },
      ],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetAlertsQuery } = statsApi;

// Para invalidar manualmente desde otros slices (ej: tras actualizar settings)
// dispatch(statsApi.util.invalidateTags([{ type: "Stats", id: storeId }]));
// dispatch(statsApi.util.invalidateTags([{ type: "Alerts", id: storeId }]));
```

---

## 8. SELECTORS USAGE (MANDATORY)
Always use named selectors — never access Redux state directly:

```js
// ✅ Correcto — siempre selectores nombrados y memoizados
const user = useSelector(selectUser);
const storeId = useSelector(selectStoreId);
const currency = useSelector(selectStoreCurrency);

// ❌ Prohibido — acceso directo al estado
const user = useSelector((state) => state.auth.user);
```

---

## 9. CACHE INVALIDATION PATTERN
After mutations that affect stats or alerts, always invalidate RTK Query cache:

```js
// Tras actualizar settings → invalidar stats para refrescar datos
const handleSaveSettings = async (settings) => {
  await dispatch(updateStoreSettings(settings));
  // Invalidamos cache de stats para que se refresquen con el nuevo margen
  dispatch(statsApi.util.invalidateTags([{ type: "Stats", id: storeId }]));
};

// Tras una simulación ejecutada → invalidar alertas
const handleExecuteAction = async () => {
  // ... ejecutar acción ...
  dispatch(statsApi.util.invalidateTags([
    { type: "Stats", id: storeId },
    { type: "Alerts", id: storeId },
  ]));
};
```

---

## 10. REDUX RULES (NON-NEGOTIABLE)
1. **One slice per domain** — nunca mezclar auth y store en el mismo slice.
2. **No derived state in Redux** — calcular en selectores, no en reducers.
3. **No async logic in reducers** — siempre `createAsyncThunk`.
4. **Always handle all 3 async states** — `pending`, `fulfilled`, `rejected`.
5. **Always use named selectors** — nunca `state.slice.field` directamente.
6. **Always use `createSelector`** — para selectores que devuelven objetos o arrays.
7. **RTK Query for server state** — nunca datos de polling en slices regulares.
8. **`auth/sessionExpired` resets everything** — el `resettableReducer` maneja esto.
9. **`isHydrating` flag** — el AuthGuard lo usa para no redirigir prematuramente.
10. **`store.current === null` means onboarding** — el OnboardingGuard lee este selector.
11. **Simulation slice blocks concurrent requests** — `condition` en el thunk evita race conditions.
12. **AbortController via `signal`** — pasar a todas las peticiones cancelables.
13. **Sanitize errors** — 5xx errors show generic message, 4xx show server message.
14. **Logger middleware only in DEV** — nunca en producción.

---

## 11. POST-MVP NOTES (do not implement now)
These patterns are documented for future scalability:
- **UI/Domain state separation:** Split `simulationSlice` into `simulationUISlice` (isOpen) and `simulationDataSlice` (action/result/loading) when multiple simultaneous simulations are needed.
- **`createEntityAdapter`:** Use for alerts and campaigns when list normalization is needed.
- **`redux-persist`:** Add RTK Query cache persistence for instant load on page refresh.
- **Feature flags slice:** `state.features = { aiEnabled, simulationEnabled }` for progressive rollout.

---

## 12. ANTI-PATTERNS (PROHIBITED)
- NO `useSelector((state) => state.something)` — always named selectors.
- NO plain selectors for objects/arrays — always `createSelector`.
- NO business logic inside reducers.
- NO API calls inside reducers — always `createAsyncThunk`.
- NO duplicate state between RTK Query and regular slices.
- NO `console.log` in production code — use logger middleware in DEV only.
- NO exposing raw 5xx error messages to users.
- NO forgetting `rejected` case — every thunk handles errors.
- NO resetting only `auth.user` on logout — always `auth/sessionExpired`.
- NO concurrent simulations — `condition` in thunk blocks double dispatch.
- NO missing cache invalidation after mutations that affect stats or alerts.
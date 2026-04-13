// src/app/slices/storeSlice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { storeApi } from "../../api/store.api.js";

// Carga la tienda del usuario autenticado
// store.current === null significa que el usuario no ha completado el onboarding
export const fetchCurrentStore = createAsyncThunk(
  "store/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await storeApi.getMyStore();
      return data.data.store;
    } catch (error) {
      const message =
        error.response?.status < 500
          ? error.response?.data?.error
          : "Error al cargar la tienda. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

// Inicia el flujo OAuth con Shopify — devuelve { oauthUrl } para redirigir al usuario
export const connectShopify = createAsyncThunk(
  "store/connectShopify",
  async (domain, { rejectWithValue }) => {
    try {
      const { data } = await storeApi.connectShopify(domain);
      return data.data; // { oauthUrl: string }
    } catch (error) {
      const message =
        error.response?.status < 500
          ? error.response?.data?.error
          : "Error al conectar con Shopify. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

// Actualiza la configuración de la tienda
// Tras el éxito, invalida el cache de RTK Query para refrescar stats
export const updateStoreSettings = createAsyncThunk(
  "store/updateSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const { data } = await storeApi.updateSettings(settings);
      return data.data.store;
    } catch (error) {
      const message =
        error.response?.status < 500
          ? error.response?.data?.error
          : "Error al actualizar la configuración. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

// Refresca el estado de integración tras el callback OAuth de Shopify o tras una desconexión.
// Usa solo getMyStore() — getIntegrationStatus() requiere storeId como query param
// que el frontend no envía, causando 400 en storeOwnership middleware.
// shopifyDomain y metaAdAccountId en la tienda son suficientes para derivar el estado.
// connected requiere shopifyDomain Y status === "ACTIVE" — status REAUTH_REQUIRED = desconectado.
export const refreshIntegrationStatus = createAsyncThunk(
  "store/refreshIntegrationStatus",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await storeApi.getMyStore();
      const store = data.data.store;
      // Derivamos integrations del store object — shopifyDomain intacto tras disconnect,
      // por eso chequeamos status === "ACTIVE" además de Boolean(shopifyDomain)
      return {
        ...store,
        integrations: {
          shopify: {
            connected: Boolean(store.shopifyDomain) && store.status === "ACTIVE",
            status: store.status,
          },
          meta: {
            connected: Boolean(store.metaAdAccountId),
            status: store.status,
            adAccountId: store.metaAdAccountId || null,
          },
        },
      };
    } catch (error) {
      const message =
        error.response?.status < 500
          ? error.response?.data?.error
          : "Error al verificar el estado de integración. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

// Desconecta Shopify — limpia el token en backend y marca el store como REAUTH_REQUIRED.
// Tras el éxito, el componente debe llamar refreshIntegrationStatus() para sincronizar el estado.
export const disconnectShopify = createAsyncThunk(
  "store/disconnectShopify",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await storeApi.disconnectShopify();
      return data.data; // { storeId, shopifyConnected: false }
    } catch (error) {
      const message =
        error.response?.status < 500
          ? error.response?.data?.error
          : "Error al desconectar Shopify. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

// Actualiza los objetivos mensuales
export const updateMonthlyGoals = createAsyncThunk(
  "store/updateGoals",
  async (goals, { rejectWithValue }) => {
    try {
      const { data } = await storeApi.updateMonthlyGoals(goals);
      return data.data.store;
    } catch (error) {
      const message =
        error.response?.status < 500
          ? error.response?.data?.error
          : "Error al actualizar los objetivos. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState: {
    current: null, // null = sin tienda → OnboardingGuard redirige a /onboarding/shopify
    loading: false,
    integrationLoading: false, // separado de loading — OnboardingGuard no lo lee, evita desmonte/remonte
    error: null,
    // hydrated: false hasta que fetchCurrentStore complete (éxito o fallo).
    // OnboardingGuard lo usa para saber si debe redirigir o esperar.
    // Sin este flag, OnboardingGuard ve loading=false + current=null en el
    // primer render (antes de que se despache fetchCurrentStore) y redirige
    // prematuramente a /onboarding/shopify — redirect loop.
    hydrated: false,
  },
  reducers: {
    clearStoreError: (state) => {
      state.error = null;
    },
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
        state.hydrated = true; // fetch completó con éxito → OnboardingGuard puede decidir
      })
      .addCase(fetchCurrentStore.rejected, (state, action) => {
        state.current = null;
        state.loading = false;
        state.error = action.payload;
        state.hydrated = true; // fetch completó con error → asumir sin tienda, redirigir a onboarding
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
      })
      .addCase(updateMonthlyGoals.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMonthlyGoals.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(updateMonthlyGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(connectShopify.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectShopify.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(connectShopify.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshIntegrationStatus.pending, (state) => {
        // integrationLoading en lugar de loading — OnboardingGuard no reacciona,
        // evitando el desmonte de IntegrationsPage y el loop infinito
        state.integrationLoading = true;
        state.error = null;
      })
      .addCase(refreshIntegrationStatus.fulfilled, (state, action) => {
        state.current = action.payload;
        state.integrationLoading = false;
        state.hydrated = true;
      })
      .addCase(refreshIntegrationStatus.rejected, (state, action) => {
        state.integrationLoading = false;
        state.error = action.payload;
      })
      .addCase(disconnectShopify.pending, (state) => {
        // integrationLoading — mismo motivo que refreshIntegrationStatus: no afecta OnboardingGuard
        state.integrationLoading = true;
        state.error = null;
      })
      .addCase(disconnectShopify.fulfilled, (state) => {
        state.integrationLoading = false;
        // El componente llama refreshIntegrationStatus() tras este fulfilled para sincronizar
        // integrations.shopify.connected con el nuevo status del backend
      })
      .addCase(disconnectShopify.rejected, (state, action) => {
        state.integrationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStoreError } = storeSlice.actions;
export default storeSlice.reducer;

// Selectores memoizados con createSelector — evitan re-renders innecesarios
export const selectCurrentStore = createSelector(
  (state) => state.store.current,
  (current) => current
);
export const selectStoreLoading = (state) => state.store.loading;
export const selectIntegrationLoading = (state) => state.store.integrationLoading;
export const selectStoreError = (state) => state.store.error;
export const selectStoreHydrated = (state) => state.store.hydrated;

// Selectores derivados — extraen campos específicos de la tienda
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
export const selectStoreSettings = createSelector(
  (state) => state.store.current,
  (current) => current?.settings ?? null
);
export const selectMonthlyGoals = createSelector(
  (state) => state.store.current,
  (current) => current?.monthlyGoals ?? null
);
export const selectShopifyConnected = createSelector(
  (state) => state.store.current,
  (current) => current?.integrations?.shopify?.connected ?? false
);

// Thunk de invalidación cruzada — fuerza refetch inmediato de stats y alertas
// CRÍTICO: llamar después de updateStoreSettings o updateMonthlyGoals
// Si el usuario cambia el margen, el Dashboard debe reflejar el cambio SIN esperar 5 min
// Requiere que statsApi esté importado en store.js como extra argument del middleware
// Uso desde componente:
//   dispatch(updateStoreSettings(settings)).then(() => dispatch(invalidateStatsCache(storeId)))
//   dispatch(updateMonthlyGoals(goals)).then(() => dispatch(invalidateStatsCache(storeId)))
export const invalidateStatsCache = (storeId) => (dispatch) => {
  // Importamos statsApi aquí para evitar dependencia circular entre slices
  import("./statsSlice.js").then(({ statsApi }) => {
    dispatch(
      statsApi.util.invalidateTags([
        { type: "Stats", id: storeId },
        { type: "Alerts", id: storeId },
      ])
    );
  });
};

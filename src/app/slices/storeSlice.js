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
    error: null,
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
export const selectStoreError = (state) => state.store.error;

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

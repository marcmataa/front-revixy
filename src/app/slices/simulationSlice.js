// src/app/slices/simulationSlice.js
// Sheet singleton controlado por Redux — se puede abrir desde cualquier página
// sin navegación (alertas, chat, tabla de stats)
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { aiApi } from "../../api/ai.api.js";

// Ejecuta la simulación contra el backend
// signal permite cancelar la petición si el usuario cierra el Sheet antes de que termine
export const runSimulation = createAsyncThunk(
  "simulation/run",
  async ({ storeId, action }, { signal, getState, rejectWithValue }) => {
    try {
      const { data } = await aiApi.simulate({ storeId, action }, { signal });
      return data.data;
    } catch (error) {
      // Si la petición fue cancelada (AbortError) no mostramos error
      if (error.name === "AbortError") return;
      const message =
        error.response?.status < 500
          ? error.response?.data?.error
          : "Error al simular la acción. Inténtalo de nuevo.";
      return rejectWithValue(message);
    }
  },
  {
    // Bloquea dispatch si ya hay una simulación en curso
    // Evita race conditions si el usuario hace doble click en "Simular"
    condition: (_, { getState }) => {
      const { loading } = getState().simulation;
      if (loading) return false;
    },
  }
);

const simulationSlice = createSlice({
  name: "simulation",
  initialState: {
    isOpen: false,
    action: null, // { type: "PAUSE_CAMPAIGN", params: { campaignId: "123" } }
    result: null, // respuesta completa del backend
    loading: false,
    error: null,
  },
  reducers: {
    // Abre el Sheet y guarda la acción a simular
    // Uso: dispatch(openSimulation({ type: "PAUSE_CAMPAIGN", params: {...} }))
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
        // Si la petición fue cancelada (payload undefined) no actualizamos estado
        if (!action.payload) return;
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

// Selectores
export const selectSimulationIsOpen = (state) => state.simulation.isOpen;
export const selectSimulationAction = (state) => state.simulation.action;
export const selectSimulationResult = createSelector(
  (state) => state.simulation.result,
  (result) => result
);
export const selectSimulationLoading = (state) => state.simulation.loading;
export const selectSimulationError = (state) => state.simulation.error;

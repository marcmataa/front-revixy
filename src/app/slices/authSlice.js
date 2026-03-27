// src/app/slices/authSlice.js
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api.js";

// Valida el token en el servidor al montar la app
// NUNCA confiar solo en localStorage — el token puede estar expirado
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
      // 4xx → mostramos mensaje del servidor (validaciones, auth errors)
      // 5xx → mensaje genérico — nunca exponemos detalles internos al usuario
      const message =
        error.response?.status < 500
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
      const message =
        error.response?.status < 500
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
    // isHydrating: true SOLO si hay un token en localStorage que validar.
    // Si no hay token, no hay nada que hidratar → false inmediato.
    // Inicializarlo siempre en true causaba spinner infinito cuando
    // no había token (checkAuth nunca se despachaba → nunca se resolvía).
    isHydrating: !!localStorage.getItem("accessToken"),
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth — validación del token al montar la app
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
      // login
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
      // register
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
      // logout — el sessionExpired se dispara en el thunk
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectores memoizados — NUNCA acceder a state.auth.x directamente en componentes
export const selectUser = createSelector(
  (state) => state.auth.user,
  (user) => user
);
export const selectAuthLoading = (state) => state.auth.loading;
export const selectIsHydrating = (state) => state.auth.isHydrating;
export const selectAuthError = (state) => state.auth.error;

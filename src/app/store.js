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

// Resetea TODO el estado cuando la sesión expira o el usuario hace logout
// Evita que datos de la tienda anterior queden en memoria tras cerrar sesión
const resettableReducer = (state, action) => {
  if (action.type === "auth/sessionExpired") {
    state = undefined; // Redux reinicia todos los slices a su initialState
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

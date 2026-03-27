import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, selectUser, selectIsHydrating } from "../app/slices/authSlice.js";
import { fetchCurrentStore, selectCurrentStore, selectStoreHydrated } from "../app/slices/storeSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isHydrating = useSelector(selectIsHydrating);
  const currentStore = useSelector(selectCurrentStore);
  const storeHydrated = useSelector(selectStoreHydrated);
  const token = localStorage.getItem("accessToken");

  // Effect 1: valida el token contra el servidor si hay token pero no hay user.
  // Se ejecuta solo en mount — nunca re-ejecutar para evitar loops de checkAuth.
  useEffect(() => {
    if (token && !user) {
      dispatch(checkAuth());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect 2: carga la tienda cuando el user ya está resuelto.
  // CRÍTICO: este effect es independiente del anterior — se ejecuta también
  // cuando PublicGuard ya hidrato el user antes de redirigir aquí.
  // Sin este effect separado, fetchCurrentStore nunca se despacha si user
  // ya estaba seteado al montar AuthGuard (ej: viene de PublicGuard).
  useEffect(() => {
    if (user && !currentStore && !storeHydrated) {
      dispatch(fetchCurrentStore());
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (import.meta.env.DEV) {
    console.log("[AuthGuard]", { token: !!token, user: !!user, isHydrating, currentStore: !!currentStore, storeHydrated });
  }

  // Sin token → login inmediato, sin pasar por isHydrating
  if (!token) return <Navigate to="/login" replace />;

  // Con token: esperar a que checkAuth resuelva antes de cualquier decisión
  // Belt + suspenders: la condición ya está implícita por el !token check anterior
  if (isHydrating && token) return <Spinner fullScreen />;

  // Token presente, checkAuth resuelto, pero user sigue null → token inválido
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default AuthGuard;

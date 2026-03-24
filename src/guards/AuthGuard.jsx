import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, selectUser, selectIsHydrating } from "../app/slices/authSlice.js";
import { fetchCurrentStore, selectCurrentStore } from "../app/slices/storeSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isHydrating = useSelector(selectIsHydrating);
  const currentStore = useSelector(selectCurrentStore);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (token && !user) {
      // Validamos el token en servidor y cargamos la tienda despu�s de auth.
      const runHydration = async () => {
        const result = await dispatch(checkAuth());
        if (result.meta.requestStatus === "fulfilled" && !currentStore) {
          await dispatch(fetchCurrentStore());
        }
      };

      runHydration();
    }
  }, []);

  if (!token) return <Navigate to="/login" replace />;
  if (isHydrating) return <Spinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default AuthGuard;

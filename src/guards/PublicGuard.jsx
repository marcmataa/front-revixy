import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, selectUser, selectIsHydrating } from "../app/slices/authSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const PublicGuard = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isHydrating = useSelector(selectIsHydrating);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    // Si hay token pero no tenemos user, necesitamos validarlo aunque estemos
    // en una ruta pública. Sin este dispatch, isHydrating jamás baja a false
    // y el spinner queda bloqueado indefinidamente (red vacía).
    if (token && !user) {
      dispatch(checkAuth());
    }
  }, []);

  // Mientras valida el token → spinner para evitar flash del formulario
  // seguido de redirect inmediato al dashboard.
  if (token && isHydrating) return <Spinner fullScreen />;

  // Token válido + usuario cargado → redirigir al dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicGuard;

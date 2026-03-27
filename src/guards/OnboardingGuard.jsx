import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentStore, selectStoreLoading, selectStoreHydrated } from "../app/slices/storeSlice.js";
import { selectUser, selectIsHydrating } from "../app/slices/authSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const OnboardingGuard = ({ children }) => {
  const user = useSelector(selectUser);
  const isAuthHydrating = useSelector(selectIsHydrating);
  const currentStore = useSelector(selectCurrentStore);
  const storeLoading = useSelector(selectStoreLoading);
  const storeHydrated = useSelector(selectStoreHydrated);

  if (import.meta.env.DEV) {
    console.log("[OnboardingGuard]", { user: !!user, isAuthHydrating, currentStore: !!currentStore, storeLoading, storeHydrated });
  }

  // Si auth todavía está resolviendo, no tomar ninguna decisión de routing.
  // Evita el caso donde OnboardingGuard monta antes de que AuthGuard confirme al user.
  if (isAuthHydrating) return <Spinner fullScreen />;

  // Si no hay user autenticado, AuthGuard ya se habrá encargado del redirect a /login.
  // OnboardingGuard NUNCA debe disparar la lógica de tienda sin user confirmado.
  // Si llegamos aquí sin user es un estado intermedio — no redirigir, dejar pasar.
  if (!user) return null;

  // Esperar a que fetchCurrentStore haya completado al menos una vez.
  // Si hydrated=false, significa que el fetch todavía no se despachó o está en curso.
  // Redirigir antes de esto causaba el redirect loop a /onboarding/shopify.
  if (!storeHydrated || storeLoading) return <Spinner fullScreen />;

  // Usuario autenticado, store fetch completado, sin tienda → onboarding
  if (!currentStore) return <Navigate to="/onboarding/shopify" replace />;

  return children;
};

export default OnboardingGuard;

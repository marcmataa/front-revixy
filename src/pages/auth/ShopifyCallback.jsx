// src/pages/auth/ShopifyCallback.jsx
// Página de aterrizaje tras el redirect OAuth de Shopify.
// El backend redirige aquí con ?status=success&storeId=... o ?status=error&message=...
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useT } from "../../hooks/useT.js";
import toast from "react-hot-toast";
import { refreshIntegrationStatus } from "../../app/slices/storeSlice.js";
import Spinner from "../../components/ui/Spinner.jsx";

const ShopifyCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useT();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "success") {
      dispatch(refreshIntegrationStatus())
        .unwrap()
        .then(() => {
          // Tienda cargada y estado de integración actualizado — vamos al dashboard
          navigate("/dashboard", { replace: true });
        })
        .catch(() => {
          toast.error(t.auth.shopifyCallbackError);
          navigate("/onboarding/shopify", { replace: true });
        });
    } else if (status === "error") {
      // Nunca mostramos el message param raw — siempre mensaje i18n seguro
      toast.error(t.auth.shopifyOAuthFailed);
      navigate("/onboarding/shopify", { replace: true });
    } else {
      // Estado desconocido o ausente — redirigimos al inicio del onboarding
      navigate("/onboarding/shopify", { replace: true });
    }
  }, []);

  return <Spinner fullScreen label={t.auth.shopifyConnecting} />;
};

export default ShopifyCallback;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { fetchCurrentStore } from "../../app/slices/storeSlice.js";
import { authApi } from "../../api/auth.api.js";
import Spinner from "../../components/ui/Spinner.jsx";
import { useT } from "../../hooks/useT.js";

const AuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useT();

  useEffect(() => {
    const exchangeToken = async () => {
      try {
        const { data } = await authApi.getOAuthToken();
        const { accessToken } = data.data;

        if (!accessToken) throw new Error("No token received");

        localStorage.setItem("accessToken", accessToken);

        const storeResult = await dispatch(fetchCurrentStore());

        if (storeResult.meta.requestStatus === "fulfilled" && storeResult.payload) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/onboarding/shopify", { replace: true });
        }
      } catch {
        localStorage.removeItem("accessToken");
        toast.error(t.common.error);
        navigate("/login", { replace: true });
      }
    };

    exchangeToken();
  }, [dispatch, navigate, t]);

  return <Spinner fullScreen />;
};

export default AuthCallback;

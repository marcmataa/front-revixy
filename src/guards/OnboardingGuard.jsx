import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentStore, selectStoreLoading } from "../app/slices/storeSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const OnboardingGuard = ({ children }) => {
  const currentStore = useSelector(selectCurrentStore);
  const storeLoading = useSelector(selectStoreLoading);

  if (storeLoading) return <Spinner fullScreen />;
  if (!currentStore) return <Navigate to="/onboarding/shopify" replace />;

  return children;
};

export default OnboardingGuard;

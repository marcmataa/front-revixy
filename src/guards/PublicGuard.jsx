import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectIsHydrating } from "../app/slices/authSlice.js";
import Spinner from "../components/ui/Spinner.jsx";

const PublicGuard = ({ children }) => {
  const user = useSelector(selectUser);
  const isHydrating = useSelector(selectIsHydrating);
  const token = localStorage.getItem("accessToken");

  // Mientras rehidrata con token presente evitamos redirects prematuros.
  if (token && isHydrating) return <Spinner fullScreen />;

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicGuard;

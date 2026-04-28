import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const PublicRoute = ( ) => {
  const { accessToken, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet/>;
};

export default PublicRoute;

import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {

  const {
    isAuthenticated,
    role,
    loading,
  } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {

    if (role === "admin") {
      return <Navigate to="/admindashboard" replace />;
    }

    if (role === "business_manager") {
      return <Navigate to="/business-manager/dashboard" replace />;
    }

    if (role === "warehouse_manager") {
      return <Navigate to="/ware_dashboard" replace />;
    }

    if (role === "factory_manager") {
      return <Navigate to="/factorydash" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
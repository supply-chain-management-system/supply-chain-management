import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const getDashboardRedirect = (role) => {
  switch (role) {
    case 'admin':
    case 'owner':
      return '/admindashboard';
    case 'business_manager':
      return '/business-manager/dashboard';
    case 'warehouse_manager':
      return '/ware_dashboard';
    case 'factory_manager':
      return '/factorydash';
    case 'supply_manager':
      return '/supplier-manager/dashboard';
    case 'logistics_manager':
      return '/logistics_dashboard';
    default:
      return '/';
  }
};

const ProtectedRoute = ({ children, allowedRoles, publicOnly = false }) => {
  const { isAuthenticated, loading, role } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
        <p className="text-sm font-semibold tracking-wider text-gray-400 uppercase animate-pulse">
          Validating Session…
        </p>
      </div>
    );
  }

  if (publicOnly) {
    if (isAuthenticated) {
      return <Navigate to={getDashboardRedirect(role)} replace />;
    }
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardRedirect(role)} replace />;
  }

  return children;
};

export default ProtectedRoute;

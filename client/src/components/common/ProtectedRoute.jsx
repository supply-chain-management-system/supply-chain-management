import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const userNeedsOnboarding = (role, companyVerified) => {
  return (role === 'owner' || role === 'business_manager') && companyVerified !== true;
};

const getDashboardRedirect = (role, companyVerified) => {
  if (userNeedsOnboarding(role, companyVerified)) {
    return '/company-onboarding';
  }
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
  const { isAuthenticated, loading, role, user } = useSelector((state) => state.auth);
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

  const companyVerified = user?.company_verified;
  const needsOnboarding = userNeedsOnboarding(role, companyVerified);

  if (publicOnly) {
    if (isAuthenticated) {
      return <Navigate to={getDashboardRedirect(role, companyVerified)} replace />;
    }
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if required and not currently on it
  if (needsOnboarding && location.pathname !== '/company-onboarding') {
    return <Navigate to="/company-onboarding" replace />;
  }

  // Redirect away from onboarding if onboarding is already complete
  if (!needsOnboarding && location.pathname === '/company-onboarding') {
    return <Navigate to={getDashboardRedirect(role, companyVerified)} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardRedirect(role, companyVerified)} replace />;
  }

  return children;
};

export default ProtectedRoute;

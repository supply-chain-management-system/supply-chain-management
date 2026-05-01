import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import BusinessManagerLayout from './features/business_manager/layouts/BusinessManagerLayout';
import DashboardPage from './features/business_manager/pages/DashboardPage';
import FactoryPage from './features/business_manager/pages/FactoryPage';
import WarehousePage from './features/business_manager/pages/WarehousePage';
import LogisticsPage from './features/business_manager/pages/LogisticsPage';
import SuppliersPage from './features/business_manager/pages/SuppliersPage';
import AddManager from './features/admin_front/AddManager';
import Login from './features/auth/pages/login';
import Signup from './features/auth/pages/signup';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/business-manager/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/business-manager" element={<BusinessManagerLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="factory" element={<FactoryPage />} />
          <Route path="warehouse" element={<WarehousePage />} />
          <Route path="logistics" element={<LogisticsPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
        </Route>
                   <Route path="/addmanagers" element={<AddManager />} />
        <Route path="*" element={<div className="p-8 text-red-500">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
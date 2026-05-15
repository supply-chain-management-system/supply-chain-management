import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import BusinessManagerLayout from './features/business_manager/layouts/BusinessManagerLayout';
import DashboardPage from './features/business_manager/pages/DashboardPage';
import FactoryPage from './features/business_manager/pages/FactoryPage';
import WarehousePage from './features/business_manager/pages/WarehousePage';
import LogisticsPage from './features/business_manager/pages/LogisticsPage';
import SuppliersPage from './features/business_manager/pages/SuppliersPage';
import AddManager from './features/admin_front/admin_pages/AddManager';
import Login from './features/auth/pages/login';
import Signup from './features/auth/pages/signup';
import CompanyOnboarding from './features/auth/layouts/companyonboard';
import FaceVerification from './features/auth/pages/face-verification';
import A_Layout from './features/admin_front/admin_layout/A_Layout';
import Admin_dashboard from './features/admin_front/admin_pages/Admin_dashboard';
import ManagerGrid from './features/admin_front/admin_pages/Managers';
import RequestsPage from './features/business_manager/pages/RequestsPage';
import OTPVerification from './features/auth/pages/verify-email';
import ForgotPassword from './features/auth/pages/forgot-password';
import ResetPassword from './features/auth/pages/reset-password';

import Factorydash from './features/factory_manager/pages/dashboard';
import ProductionManagement from './features/factory_manager/pages/production_page';
import Team from './features/factory_manager/pages/factory_team';
import LayoutFactory from './features/factory_manager/layout/dashboarslayout';
import Dashboardfactory from './features/factory_manager/pages/dashboard';

import ProductionOutputHistory from './features/factory_manager/pages/outputlogs';



import { Ribbon } from 'lucide-react';
import Machine from './features/factory_manager/pages/factory_machine';


import BusinessCardPage from './features/admin_front/admin_pages/business_card';




import Ware_Layout from './features/warehouse_manager/ware_layout';
import WarehouseDashboard from './features/warehouse_manager/WarehouseDashboard';
import WareProduct from './features/warehouse_manager/Wareproducts';
import InventoryPage from './features/warehouse_manager/InventoryPage';
import RackPage from './features/warehouse_manager/RackPage';
import StockUpdatePage from './features/warehouse_manager/StockUpdatePage';
import CreateWarehouse from './features/admin_front/admin_pages/CreateWarehouse';


import InviteAcceptPage from './features/auth/pages/invitation';

import ProtectedRoute from './protectedroutes/authenticate_protector';
import PublicRoute from './protectedroutes/block_public_pages';


function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">

      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="px-4 py-2 rounded-lg font-semibold shadow-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-400 transition-all"
        >
          {isDarkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <Router>

        <Routes>

          <Route path="/" element={<Navigate to="/business-manager/dashboard" replace />} />

          {/* PUBLIC ROUTES */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/face-verification" element={<FaceVerification />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/company-onboarding" element={<CompanyOnboarding />} />

          <Route path="/business-manager" element={<BusinessManagerLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="factory" element={<FactoryPage />} />
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="logistics" element={<LogisticsPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="requests" element={<RequestsPage />} />
          </Route>
             
          <Route  element={<A_Layout />}>
            <Route path="/admindashboard" element={<Admin_dashboard />} />
            <Route path="/managers" element={<ManagerGrid/>} />
            <Route path="/add/bussiness-card" element={<BusinessCardPage />} />
            <Route path="/addmanagers" element={<AddManager />} />

            <Route path="/createwarehouse" element={<CreateWarehouse/>} />

          </Route>

       
          <Route path="/verify-email" element={<OTPVerification />} />
          <Route path="/invite/accept/:token" element={<InviteAcceptPage />} />
          <Route path="/face-verification" element={<FaceVerification />} />
          <Route path="/company-onboarding" element={<CompanyOnboarding />} />



          </Route>


          







        


          {/* BUSINESS MANAGER */}
          <Route
            // element={
            //   <ProtectedRoute allowedRoles={['business_manager']} />
            // }
          >
            <Route
              path="/business-manager"
              element={<BusinessManagerLayout />}
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="factory" element={<FactoryPage />} />
              <Route path="warehouse" element={<WarehousePage />} />
              <Route path="logistics" element={<LogisticsPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="requests" element={<RequestsPage />} />
            </Route>

          </Route>

          {/* ADMIN */}
          <Route
            // element={
            //   <ProtectedRoute allowedRoles={['admin']} />
            // }
          >
            <Route element={<A_Layout />}>
              <Route path="/admindashboard" element={<Admin_dashboard />} />
              <Route path="/managers" element={<ManagerGrid />} />
              <Route path="/add/bussiness-card" element={<BusinessCardPage />} />
              <Route path="/addmanagers" element={<AddManager />} />
              <Route path="/createwarehouse" element={<CreateWarehouse />} />
            </Route>

          </Route>

          {/* WAREHOUSE MANAGER */}
          <Route
            // element={
            //   <ProtectedRoute allowedRoles={['warehouse_manager']} />
            // }
          >
            <Route element={<Ware_Layout />}>
              <Route path="/ware_dashboard" element={<WarehouseDashboard />} />
              <Route path="/ware_products" element={<WareProduct />} />
              <Route path="/Inventory" element={<InventoryPage />} />
              <Route path="/Racks" element={<RackPage />} />
              <Route path="/stockupdate" element={<StockUpdatePage />} />
            </Route>
          </Route>

          {/* FACTORY MANAGER */}
          <Route
            // element={
            //   <ProtectedRoute allowedRoles={['factory_manager']} />
            // }
          >
            <Route element={<LayoutFactory />}>
              <Route path="production" element={<ProductionManagement />} />
              <Route path="factorydash" element={<Factorydash />} />
              <Route path="factoryteam" element={<Team />} />
                 <Route path='/factory_machine' element={<Machine/>}/>
            <Route path='/outputlogs' element={<ProductionOutputHistory/>}/>
            </Route>
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="p-8 text-red-500 font-bold flex justify-center items-center h-screen">
                404 - Page Not Found
              </div>
            }
          />

        </Routes>

      </Router>

    </div>
  );
}

export default App;
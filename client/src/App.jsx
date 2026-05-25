import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import BusinessManagerLayout from './features/business_manager/layouts/BusinessManagerLayout';
import DashboardPage from './features/business_manager/pages/DashboardPage';
import FactoryPage from './features/business_manager/pages/FactoryPage';
import WarehousePage from './features/business_manager/pages/WarehousePage';
import LogisticsPage from './features/business_manager/pages/LogisticsPage';
import SuppliersPage from './features/business_manager/pages/SuppliersPage';
import SupplyManagerPage from './features/business_manager/pages/SupplyManagerPage';
import AddManager from './features/admin_front/admin_pages/AddManager';
import Login from './features/auth/pages/login';
import Signup from './features/auth/pages/signup';
import CompanyOnboarding from './features/auth/layouts/companyonboard';
import FaceVerification from './features/auth/pages/face-verification';
import A_Layout from './features/admin_front/admin_layout/A_Layout';
import Admin_dashboard from './features/admin_front/admin_pages/Admin_dashboard';
import ManagerGrid from './features/admin_front/admin_pages/Managers';
import BusinessManagerDetails from './features/admin_front/admin_pages/BusinessManagerDetails';
import RequestsPage from './features/business_manager/pages/RequestsPage';
import OTPVerification from './features/auth/pages/verify-email';
import ForgotPassword from './features/auth/pages/forgot-password';
import ResetPassword from './features/auth/pages/reset-password';
import ChatPage from './features/chat/ChatPage';
import BM_Profile from './features/business_manager/pages/ProfilePage';
import SM_Profile from './features/supplier_manager/pages/ProfilePage';

import SupplierManagerLayout from './features/supplier_manager/layouts/SupplierManagerLayout';
import SM_Dashboard from './features/supplier_manager/pages/DashboardPage';
import SM_Suppliers from './features/supplier_manager/pages/SuppliersPage';
import SM_Inventory from './features/supplier_manager/pages/InventoryPage';
import SM_Orders from './features/supplier_manager/pages/OrdersPage';
import SM_Requests from './features/supplier_manager/pages/RequestsPage';

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

import LogisticsLayout from './features/logistics_manager/LogisticsLayout';
import LogisticsDashboard from './features/logistics_manager/LogisticsDashboard';
import LogisticsFleetPage from './features/logistics_manager/pages/LogisticsFleetPage';

import ProtectedRoute from './protectedroutes/authenticate_protector';
import PublicRoute from './protectedroutes/block_public_pages';
import KorvexLanding, { ContactSalesPage, SubscriptionsPage } from './components/layout/landing_page';


function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
      <Router>

        <Routes>

          <Route path="/" element={<KorvexLanding />} />
          <Route path="/pricing" element={<SubscriptionsPage />} />
          <Route path="/subscriptions" element={<Navigate to="/pricing" replace />} />
          <Route path="/contact-sales" element={<ContactSalesPage />} />

          {/* PUBLIC ROUTES */}
          <Route >
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
            <Route path="supply-managers" element={<SupplyManagerPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile" element={<BM_Profile />} />
          </Route>
             
          <Route  element={<A_Layout />}>
            <Route path="/admindashboard" element={<Admin_dashboard />} />
            <Route path="/managers" element={<ManagerGrid/>} />
            <Route path="/add/bussiness-card" element={<BusinessCardPage />} />
            <Route path="/addmanagers" element={<AddManager />} />

            <Route path="/createwarehouse" element={<CreateWarehouse/>} />
            <Route path="/admin-chat" element={<ChatPage />} />

          </Route>

       
          <Route path="/verify-email" element={<OTPVerification />} />
          <Route path="/invite/accept/:token" element={<InviteAcceptPage />} />
          <Route path="/invite/register/:token" element={<InviteAcceptPage />} />
          <Route path="/invite/:token" element={<InviteAcceptPage />} />
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
              <Route path="supply-managers" element={<SupplyManagerPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<BM_Profile />} />
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
              <Route path="/managers/:cardId" element={<BusinessManagerDetails />} />
              <Route path="/add/bussiness-card" element={<BusinessCardPage />} />
              <Route path="/addmanagers" element={<AddManager />} />
              <Route path="/createwarehouse" element={<CreateWarehouse />} />
              <Route path="/admin-chat" element={<ChatPage />} />
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
              <Route path="/ware-chat" element={<ChatPage />} />
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
            <Route path="/factory-chat" element={<ChatPage />} />
            </Route>
          </Route>


          {/* SUPPLIER MANAGER */}
          <Route>
            <Route
              path="/supplier-manager"
              element={<SupplierManagerLayout />}
            >
              <Route path="dashboard" element={<SM_Dashboard />} />
              <Route path="suppliers" element={<SM_Suppliers />} />
              <Route path="inventory" element={<SM_Inventory />} />
              <Route path="orders" element={<SM_Orders />} />
              <Route path="requests" element={<SM_Requests />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<SM_Profile />} />
            </Route>
          </Route>

          {/* LOGISTICS MANAGER */}
          <Route
            // element={
            //   <ProtectedRoute allowedRoles={['logistics_manager']} />
            // }
          >
            <Route element={<LogisticsLayout />}>
              <Route path="/logistics_dashboard" element={<LogisticsDashboard />} />
              <Route path="/logistics_fleet" element={<LogisticsFleetPage />} />
              <Route path="/logistics-chat" element={<ChatPage />} />
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

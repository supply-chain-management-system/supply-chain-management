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

// Import unified role-adaptive ProfilePage
import ProfilePage from './components/profile/ProfilePage';

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
import ProductionELT from './features/elt/factory_elt';
import WarehouseELT from './features/elt/warehouse_elt';
import LogisticsELT from './features/elt/logistics_elt';
import ProductionOutputHistory from './features/factory_manager/pages/outputlogs';
import FactoryMaterial from './features/factory_manager/pages/factory_material';

import Machine from './features/factory_manager/pages/factory_machine';
import BusinessCardPage from './features/admin_front/admin_pages/business_card';
import CompaniesPage from './features/admin_front/admin_pages/Companies';
import SubManagersPage from './features/admin_front/admin_pages/SubManagers';
import FactoryOversightPage from './features/admin_front/admin_pages/FactoryOversight';
import FinancialPage from './features/admin_front/admin_pages/Financial';

import Ware_Layout from './features/warehouse_manager/ware_layout';
import WarehouseDashboard from './features/warehouse_manager/WarehouseDashboard';
import WareProduct from './features/warehouse_manager/Wareproducts';
import InventoryPage from './features/warehouse_manager/InventoryPage';
import RackPage from './features/warehouse_manager/RackPage';
import StockUpdatePage from './features/warehouse_manager/StockUpdatePage';
import CreateWarehouse from './features/admin_front/admin_pages/CreateWarehouse';
import WarehouseRequestsPage from './features/warehouse_manager/WarehouseRequestsPage';

import InviteAcceptPage from './features/auth/pages/invitation';

import LogisticsLayout from './features/logistics_manager/layouts/LogisticsLayout';
import LogisticsDashboard from './features/logistics_manager/pages/LogisticsDashboard';
import LogisticsFleetPage from './features/logistics_manager/pages/LogisticsFleetPage';
import LogisticsShipmentsPage from './features/logistics_manager/pages/LogisticsShipmentsPage';
import LogisticsRoutesPage from './features/logistics_manager/pages/LogisticsRoutesPage';
import LogisticsAnalyticsPage from './features/logistics_manager/pages/LogisticsAnalyticsPage';
import LogisticsSettingsPage from './features/logistics_manager/pages/LogisticsSettingsPage';
import LogisticsRequestsPage from './features/logistics_manager/pages/LogisticsRequestsPage';
import FactoryRequestsPage from './features/factory_manager/pages/FactoryRequestsPage';

import KorvexLanding, { ContactSalesPage, SubscriptionsPage } from './components/layout/landing_page';
import PaymentSuccess from './features/auth/pages/PaymentSuccess';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
      <Router>
        <Routes>
          {/* LANDING / MARKETING PAGES */}
          <Route path="/" element={<KorvexLanding />} />
          <Route path="/pricing" element={<SubscriptionsPage />} />
          <Route path="/subscriptions" element={<Navigate to="/pricing" replace />} />
          <Route path="/contact-sales" element={<ContactSalesPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* AUTHENTICATION / ONBOARDING */}
          <Route path="/login" element={<ProtectedRoute publicOnly><Login /></ProtectedRoute>} />
          <Route path="/signup" element={<ProtectedRoute publicOnly><Signup /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ProtectedRoute publicOnly><ForgotPassword /></ProtectedRoute>} />
          <Route path="/reset-password/:token" element={<ProtectedRoute publicOnly><ResetPassword /></ProtectedRoute>} />
          <Route path="/verify-email" element={<ProtectedRoute publicOnly><OTPVerification /></ProtectedRoute>} />
          <Route path="/invite/accept/:token" element={<ProtectedRoute publicOnly><InviteAcceptPage /></ProtectedRoute>} />
          <Route path="/invite/register/:token" element={<ProtectedRoute publicOnly><InviteAcceptPage /></ProtectedRoute>} />
          <Route path="/invite/:token" element={<ProtectedRoute publicOnly><InviteAcceptPage /></ProtectedRoute>} />
          
          <Route path="/face-verification" element={<ProtectedRoute><FaceVerification /></ProtectedRoute>} />
          <Route path="/company-onboarding" element={<ProtectedRoute><CompanyOnboarding /></ProtectedRoute>} />

          {/* BUSINESS MANAGER PANEL */}
          <Route
            path="/business-manager"
            element={
              <ProtectedRoute allowedRoles={['owner', 'business_manager']}>
                <BusinessManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="factory" element={<FactoryPage />} />
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="logistics" element={<LogisticsPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="supply-managers" element={<SupplyManagerPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* ADMIN PORTAL */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin', 'owner']}>
                <A_Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/admindashboard" element={<Admin_dashboard />} />
            <Route path="/managers" element={<ManagerGrid />} />
            <Route path="/managers/:cardId" element={<BusinessManagerDetails />} />
            <Route path="/add/bussiness-card" element={<BusinessCardPage />} />
            <Route path="/addmanagers" element={<AddManager />} />
            <Route path="/createwarehouse" element={<CreateWarehouse />} />
            <Route path="/admin-chat" element={<ChatPage />} />
            <Route path="/admin_profile" element={<ProfilePage />} />
            <Route path="/admin/companies" element={<CompaniesPage />} />
            <Route path="/admin/sub-managers" element={<SubManagersPage />} />
            <Route path="/admin/factory" element={<FactoryOversightPage />} />
            <Route path="/admin/financial" element={<FinancialPage />} />
          </Route>

          {/* WAREHOUSE MANAGER PORTAL */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['warehouse_manager']}>
                <Ware_Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/ware_dashboard" element={<WarehouseDashboard />} />
            <Route path="/ware_products" element={<WareProduct />} />
            <Route path="/Inventory" element={<InventoryPage />} />
            <Route path="/Racks" element={<RackPage />} />
            <Route path="/stockupdate" element={<StockUpdatePage />} />
            <Route path="/elt_warehouse" element={<WarehouseELT />} />
            <Route path="/ware_requests" element={<WarehouseRequestsPage />} />
            <Route path="/ware-chat" element={<ChatPage />} />
            <Route path="/ware_profile" element={<ProfilePage />} />
          </Route>

          {/* FACTORY MANAGER PORTAL */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['factory_manager']}>
                <LayoutFactory />
              </ProtectedRoute>
            }
          >
            <Route path="production" element={<ProductionManagement />} />
            <Route path="factorydash" element={<Factorydash />} />
            <Route path="factoryteam" element={<Team />} />
            <Route path="factory_machine" element={<Machine />} />
            <Route path="outputlogs" element={<ProductionOutputHistory />} />
            <Route path="elt_production" element={<ProductionELT />} />
            <Route path="factory_material" element={<FactoryMaterial />} />
            <Route path="factory_requests" element={<FactoryRequestsPage />} />
            <Route path="factory-chat" element={<ChatPage />} />
            <Route path="factory_profile" element={<ProfilePage />} />
          </Route>

          {/* SUPPLIER MANAGER PANEL */}
          <Route
            path="/supplier-manager"
            element={
              <ProtectedRoute allowedRoles={['supply_manager']}>
                <SupplierManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SM_Dashboard />} />
            <Route path="suppliers" element={<SM_Suppliers />} />
            <Route path="inventory" element={<SM_Inventory />} />
            <Route path="orders" element={<SM_Orders />} />
            <Route path="requests" element={<SM_Requests />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* LOGISTICS MANAGER PORTAL */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['logistics_manager']}>
                <LogisticsLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/logistics_dashboard" element={<LogisticsDashboard />} />
            <Route path="/logistics_fleet" element={<LogisticsFleetPage />} />
            <Route path="/logistics_shipments" element={<LogisticsShipmentsPage />} />
            <Route path="/logistics_routes" element={<LogisticsRoutesPage />} />
            <Route path="/logistics_analytics" element={<LogisticsELT />} />
            <Route path="/logistics_settings" element={<LogisticsSettingsPage />} />
            <Route path="/logistics_requests" element={<LogisticsRequestsPage />} />
            <Route path="/logistics_profile" element={<ProfilePage />} />
            <Route path="/logistics-chat" element={<ChatPage />} />
          </Route>

          {/* 404 ROUTE */}
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

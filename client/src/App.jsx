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
import FaceRegistration from './features/auth/pages/register-face';
import FaceVerification from './features/auth/pages/face-verification';
import A_Layout from './features/admin_front/admin_layout/A_Layout';
import Admin_dashboard from './features/admin_front/admin_pages/Admin_dashboard';
import ManagerGrid from './features/admin_front/admin_pages/Managers';
import OTPVerification from './features/auth/pages/verify-email';
import ForgotPassword from './features/auth/pages/forgot-password';
import ResetPassword from './features/auth/pages/reset-password';




import Factorydash from './features/factory_manager/pages/dashboard';
import  ProductionManagement from './features/factory_manager/pages/production_page'
import Team from './features/factory_manager/pages/factory_team'
import LayoutFactory from './features/factory_manager/layout/dashboarslayout';

import { Ribbon } from 'lucide-react';
import Machine from './features/factory_manager/pages/factory_machine';

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
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<OTPVerification />} />
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
          </Route>
             
          <Route  element={<A_Layout />}>
            <Route path="/admindashboard" element={<Admin_dashboard />} />
            <Route path="/managers" element={<ManagerGrid/>} />
            <Route path="/addmanagers" element={<AddManager />} />
           
          </Route>


          




          <Route path="/addmanagers" element={<AddManager />} />


          <Route path="/" element={<LayoutFactory />}>
          <Route path='production' element={<ProductionManagement/>}/>
          <Route path='factorydash' element={<Factorydash/>}/>
          <Route path='factoryteam' element={<Team/>}/>
           <Route path='/factory_machine' element={<Machine/>}/>
          </Route>


 

          
          <Route path="*" element={<div className="p-8 text-red-500 font-bold flex justify-center items-center h-screen">404 - Page Not Found</div>} />
        </Routes>
      </Router>
      
    </div>

  );
}

export default App;
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LogisticsSidebar from './LogisticsSidebar';
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { logoutUser } from '../../../redux/authSlice';
import LogoutConfirmModal from '../../../components/profile/LogoutConfirmModal';

const routeLabels = {
  '/logistics_dashboard': 'Dashboard',
  '/logistics_shipments': 'Shipments',
  '/logistics_requests': 'Requests',
  '/logistics_routes': 'Stands & Tracking',
  '/logistics_fleet': 'Fleet Management',
  '/logistics_analytics': 'Analytics',
  '/logistics_settings': 'Settings',
};

const LogisticsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pageTitle = routeLabels[location.pathname] ?? 'Logistics';
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black font-sans antialiased">

      <LogisticsSidebar />

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* ── Topbar ── */}
        <header className="shrink-0 h-14 flex items-center justify-between px-6 gap-4
                           bg-[#0d0d0d] border-b border-white/[0.06]">

          {/* Page title */}
          <div>
            <span className="text-[10px] text-white/30 uppercase tracking-widest leading-none">Logistics</span>
            <h1 className="text-sm font-semibold text-white leading-none mt-0.5">{pageTitle}</h1>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-6
                          bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5
                          focus-within:border-emerald-500/40 transition-colors duration-200">
            <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="Search shipments, stands..."
              className="bg-transparent text-xs text-white/60 placeholder-white/25 outline-none w-full"
            />
          </div>
 
          {/* Right */}
          <div className="flex items-center gap-1.5">
 
            <button className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-all duration-200">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </button>
 
            <div className="w-px h-5 bg-white/[0.07] mx-1" />
 
            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-xs font-bold text-black shrink-0 uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:block text-xs font-medium text-white/80">{user?.name || 'User'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#111] border border-white/[0.08] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
                  <div className="p-1">
                    <button
                      onClick={() => { navigate('/logistics_profile'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      <User className="w-3.5 h-3.5" /> My Profile
                    </button>
                    <button
                      onClick={() => { navigate('/logistics_settings'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <div className="my-1 border-t border-white/[0.05]" />
                    <button
                      onClick={() => { setShowLogoutModal(true); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.07] transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#080808] p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        accentColor="from-emerald-500 via-emerald-600 to-teal-600"
        isDark={true}
      />
    </div>
  );
};

export default LogisticsLayout;

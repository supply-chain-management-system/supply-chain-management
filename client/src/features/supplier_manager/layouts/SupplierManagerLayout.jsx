import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { logoutUser } from '../../../redux/authSlice';
import LogoutConfirmModal from '../../../components/profile/LogoutConfirmModal';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  BellRing, 
  LogOut, 
  Menu, 
  X,
  Gem,
  MessageSquare,
  User,
  ChevronDown,
  BarChart3,
} from 'lucide-react';

const SupplierManagerLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { name: 'Dashboard', path: '/supplier-manager/dashboard', icon: LayoutDashboard },
    { name: 'Suppliers', path: '/supplier-manager/suppliers', icon: Users },
    { name: 'Inventory', path: '/supplier-manager/inventory', icon: Package },
    { name: 'Orders', path: '/supplier-manager/orders', icon: ShoppingCart },
    { name: 'Requests', path: '/supplier-manager/requests', icon: BellRing },
    { name: 'Analytics', path: '/supplier-manager/analytics', icon: BarChart3 },
    { name: 'Chat', path: '/supplier-manager/chat', icon: MessageSquare },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0a0a] font-sans flex flex-col relative overflow-hidden">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* TOP NAVBAR */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 flex items-center h-20 gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3 mr-4 shrink-0 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] group-hover:scale-110 transition-transform duration-300">
              <Gem size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tighter leading-none">Korvex</span>
              <span className="text-[10px] text-rose-500 font-bold uppercase tracking-[0.2em] mt-1">Supply Chain</span>
            </div>
          </div>

          {/* Nav links - desktop */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] border border-white/10'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-red-500' : 'text-gray-500'}>
                      <item.icon size={18} />
                    </span>
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-6 ml-auto">
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
              <BellRing size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f0a0a]" />
            </button>

            {/* User Profile Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="flex items-center gap-4 pl-6 border-l border-white/10 group cursor-pointer"
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <p className="text-white text-sm font-bold tracking-tight leading-none group-hover:text-red-500 transition-colors">{user?.name || 'Manager'}</p>
                  <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1">Korvex Manager</p>
                </div>
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-[2px] transition-transform group-hover:rotate-6">
                    <div className="w-full h-full rounded-[10px] bg-[#1a1111] flex items-center justify-center text-white font-black text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'R'}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-white/30 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a0a0a] border border-white/[0.08] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 overflow-hidden">
                  <div className="p-1">
                    <button
                      onClick={() => { navigate('/supplier-manager/profile'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-all font-medium"
                    >
                      <User size={16} /> My Profile
                    </button>
                    <div className="my-1 border-t border-white/[0.05]" />
                    <button
                      onClick={() => { setShowLogoutModal(true); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400/80 hover:text-red-300 hover:bg-red-500/[0.07] transition-all font-medium"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#0f0a0a] border-t border-white/5 px-6 py-6 flex flex-col gap-2 animate-in slide-in-from-top duration-300">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold ${
                    isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={22} />
                {item.name}
              </NavLink>
            ))}
            {/* Mobile logout */}
            <button
              onClick={() => { setShowLogoutModal(true); setMobileOpen(false); }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold text-red-400 hover:bg-red-500/10 transition-all mt-2"
            >
              <LogOut size={22} /> Sign Out
            </button>
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-screen-2xl mx-auto px-6 py-10">
          <Outlet />
        </div>
      </main>
      
      {/* FOOTER STRIP */}
      <footer className="h-10 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-center">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">Korvex Supply Chain Management Systems v1.0</p>
      </footer>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        accentColor="from-red-600 to-rose-500"
        isDark={true}
      />
    </div>
  );
};

export default SupplierManagerLayout;

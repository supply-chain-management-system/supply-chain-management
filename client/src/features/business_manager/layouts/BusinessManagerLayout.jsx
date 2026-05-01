import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../redux/authSlice';

const BusinessManagerLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/business-manager/dashboard', icon: '⬡' },
    { name: 'Factory', path: '/business-manager/factory', icon: '⚙' },
    { name: 'Warehouse', path: '/business-manager/warehouse', icon: '▦' },
    { name: 'Logistics', path: '/business-manager/logistics', icon: '↗' },
    { name: 'Suppliers', path: '/business-manager/suppliers', icon: '◈' },
    { name: 'Requests', path: '/business-manager/requests', icon: '◎' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] font-sans flex flex-col">
      {/* TOP NAVBAR */}
      <header className="bg-[#0f172a] border-b border-slate-700/60 sticky top-0 z-50 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center h-16 gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-sm shadow">N</div>
            <span className="text-white font-bold text-lg tracking-tight">NexusGrid</span>
            <span className="ml-1 text-[10px] text-blue-400 font-semibold uppercase tracking-widest bg-blue-900/40 px-2 py-0.5 rounded-full">Business</span>
          </div>

          {/* Nav links - desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <span className="text-xs opacity-70">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification bell */}
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">4</span>
            </button>

            {/* Avatar / logout */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'B'}
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-xs font-semibold leading-none">{user?.name || 'Manager'}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Business Manager</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-slate-300 hover:text-white ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-700/60 px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <span>{item.icon}</span>{item.name}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default BusinessManagerLayout;
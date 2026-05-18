import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import LogisticsSidebar from './LogisticsSidebar';
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';

const routeLabels = {
  '/logistics_dashboard': 'Dashboard',
  '/logistics_shipments': 'Shipments',
  '/logistics_routes': 'Routes & Tracking',
  '/logistics_fleet': 'Fleet Management',
  '/logistics_settings': 'Settings',
};

const LogisticsLayout = () => {
  const location = useLocation();
  const pageTitle = routeLabels[location.pathname] ?? 'Logistics';
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden font-sans antialiased"
      style={{ background: 'linear-gradient(135deg, #0b1120 0%, #0f172a 50%, #1a1040 100%)' }}
    >
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-600/8 blur-[100px]" />
      </div>

      {/* Sidebar */}
      <LogisticsSidebar />

      {/* Main area */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* ── Topbar ── */}
        <header
          className="shrink-0 h-16 flex items-center justify-between px-6 gap-4
                     border-b border-white/[0.06]"
          style={{
            background: 'rgba(11, 17, 32, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Left: Page title */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 leading-none mb-0.5">Logistics Management</span>
              <h1 className="text-base font-semibold text-white leading-none">{pageTitle}</h1>
            </div>
          </div>

          {/* Centre: Search bar */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm mx-4
                          bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2
                          focus-within:border-blue-500/50 focus-within:bg-white/[0.06] transition-all duration-200">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search shipments, routes…"
              className="bg-transparent text-sm text-slate-300 placeholder-slate-500 outline-none w-full"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-xl text-slate-400 hover:text-white
                         hover:bg-white/[0.06] transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0b1120]" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/[0.08] mx-1" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl
                           hover:bg-white/[0.06] transition-all duration-200"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  A
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-medium text-white leading-none">Admin</span>
                  <span className="text-[10px] text-slate-500 leading-none mt-0.5">Logistics Manager</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/[0.08]
                             shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                  style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="p-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <div className="my-1 border-t border-white/[0.06]" />
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-all">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LogisticsLayout;

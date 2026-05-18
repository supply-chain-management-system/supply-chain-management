import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Package,
  LayoutDashboard,
  Settings,
  BarChart3,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    to: '/logistics_dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Shipments',
    to: '/logistics_shipments',
    icon: Package,
    badge: '14',
  },
  {
    label: 'Routes & Tracking',
    to: '/logistics_routes',
    icon: MapPin,
    badge: null,
  },
  {
    label: 'Fleet Management',
    to: '/logistics_fleet',
    icon: Truck,
    badge: '3',
    badgeColor: 'bg-amber-500',
  },
  {
    label: 'Analytics',
    to: '/logistics_analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    label: 'Settings',
    to: '/logistics_settings',
    icon: Settings,
    badge: null,
  },
];

const LogisticsSidebar = () => {
  return (
    <aside
      className="relative z-20 w-64 shrink-0 flex flex-col h-screen border-r border-white/[0.06] select-none"
      style={{
        background: 'rgba(9, 14, 28, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-white/[0.06]">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
        >
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-tight leading-none">LogiManage</span>
          <span className="text-[10px] text-slate-500 leading-none mt-1">Supply Chain Platform</span>
        </div>
      </div>

      {/* ── Status pill ── */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">All systems operational</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2 space-y-0.5">

        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pb-2 pt-1">
          Main Menu
        </p>

        {navItems.slice(0, 4).map(({ label, to, icon: Icon, badge, badgeColor }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-200 no-underline',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',
              ].join(' ')
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background:
                      'linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.06) 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2)',
                  }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                {/* Active bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #60a5fa, #818cf8)' }}
                  />
                )}

                <Icon
                  className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                  style={{ width: '18px', height: '18px' }}
                />
                <span className="flex-1 leading-none">{label}</span>

                {/* Badge */}
                {badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none text-white ${
                      badgeColor ?? 'bg-blue-600'
                    }`}
                  >
                    {badge}
                  </span>
                )}

                {/* Hover chevron */}
                {!isActive && (
                  <ChevronRight
                    className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="my-3 border-t border-white/[0.05]" />

        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 pb-2 pt-1">
          Management
        </p>

        {navItems.slice(4).map(({ label, to, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-200 no-underline',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]',
              ].join(' ')
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background:
                      'linear-gradient(90deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.06) 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.2)',
                  }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #60a5fa, #818cf8)' }}
                  />
                )}
                <Icon
                  className={`shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                  style={{ width: '18px', height: '18px' }}
                />
                <span className="flex-1 leading-none">{label}</span>
                {badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none text-white bg-blue-600">
                    {badge}
                  </span>
                )}
                {!isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom user card ── */}
      <div className="px-3 pb-5 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.06] transition-all duration-200">
          <div
            className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white leading-none truncate">Admin User</p>
            <p className="text-[10px] text-slate-500 leading-none mt-1 truncate">admin@logimanage.io</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        </div>
      </div>
    </aside>
  );
};

export default LogisticsSidebar;

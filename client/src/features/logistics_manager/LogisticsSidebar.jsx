import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Truck,
  MapPin,
  Package,
  LayoutDashboard,
  Settings,
  BarChart3,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

const NavItem = ({ label, to, icon: Icon, badge, badgeAlert }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium',
        'transition-all duration-150 no-underline',
        isActive
          ? 'bg-green-500/[0.1] text-white'
          : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]',
      ].join(' ')
    }
  >
    {({ isActive }) => (
      <>
        {/* Active left bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-green-400 rounded-full" />
        )}

        <Icon
          style={{ width: '15px', height: '15px' }}
          className={`shrink-0 transition-colors duration-150 ${
            isActive ? 'text-green-400' : 'text-white/25 group-hover:text-white/50'
          }`}
        />

        <span className="flex-1 leading-none">{label}</span>

        {badge && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[18px] text-center leading-none ${
              badgeAlert
                ? 'bg-red-500/20 text-red-400'
                : 'bg-green-500/20 text-green-400'
            }`}
          >
            {badge}
          </span>
        )}

        {!isActive && !badge && (
          <ChevronRight className="w-3 h-3 text-white/15 opacity-0 group-hover:opacity-100 -translate-x-0.5 group-hover:translate-x-0 transition-all duration-150" />
        )}
      </>
    )}
  </NavLink>
);

const LogisticsSidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const { vehicles } = useSelector((state) => state.logisticsDashboard);

  const navSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', to: '/logistics_dashboard', icon: LayoutDashboard },
        { label: 'Shipments', to: '/logistics_shipments', icon: Package, badge: '14' },
        { label: 'Chat', to: '/logistics-chat', icon: MessageSquare },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Stands & Tracking', to: '/logistics_routes', icon: MapPin },
        { label: 'Fleet Management', to: '/logistics_fleet', icon: Truck, badge: vehicles?.length || 0, badgeAlert: true },
        { label: 'Analytics', to: '/logistics_analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', to: '/logistics_settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen bg-[#0d0d0d] border-r border-white/[0.06] select-none">

    {/* Brand */}
    <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/[0.06]">
      <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
        <Truck className="w-4 h-4 text-black" />
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-none tracking-tight">LogiManage</p>
        <p className="text-[10px] text-white/30 leading-none mt-1">Supply Chain</p>
      </div>
    </div>

    {/* Status */}
    <div className="px-4 pt-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/[0.06] border border-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
        <span className="text-[10px] text-green-400 font-medium">All systems operational</span>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {navSections.map(({ title, items }) => (
        <div key={title}>
          <p className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.15em] px-3 mb-1.5">
            {title}
          </p>
          <div className="space-y-0.5">
            {items.map(item => <NavItem key={item.to} {...item} />)}
          </div>
        </div>
      ))}
    </nav>

    {/* User card */}
    <div className="px-3 pb-4 pt-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]
                      cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.09] transition-all duration-150">
        <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center text-xs font-bold text-black shrink-0 uppercase">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white leading-none truncate">{user?.name || 'User'}</p>
          <p className="text-[10px] text-white/30 leading-none mt-1 truncate">{user?.email || 'Logistics Manager'}</p>
        </div>
        <Settings className="w-3.5 h-3.5 text-white/20 shrink-0" />
      </div>
    </div>
  </aside>
  );
};

export default LogisticsSidebar;

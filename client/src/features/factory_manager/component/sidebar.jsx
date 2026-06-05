import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  Users,
  Settings2,
  Package,
  ClipboardList,
  FileOutput,
  User,
  Cpu,
  Activity
} from 'lucide-react';

// ─── Silver/Metallic color palette ─────────────────────────────────────
const SILVER = {
  accent: '#94a3b8',       // slate-400 — silver
  accentLight: '#cbd5e1',  // slate-300 — light silver
  accentDark: '#64748b',   // slate-500 — dark silver
  activeBg: '#f1f5f9',     // slate-100
  activeText: '#334155',   // slate-700
  hoverBg: '#f8fafc',      // slate-50
};

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/factorydash' },
  { icon: Factory, label: 'Production', path: '/production' },
  { icon: Users, label: 'Teams', path: '/factoryteam' },
  { icon: Settings2, label: 'Machines', path: '/factory_machine' },
  { icon: Package, label: 'Materials', path: '/factory_material' },
  { icon: ClipboardList, label: 'Requests', path: '/factory_requests' },
  { icon: FileOutput, label: 'Output Logs', path: '/outputlogs' },
  { icon: Activity, label: 'ELT Analytics', path: '/elt_production' },
  { icon: User, label: 'Profile', path: '/factory_profile' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r overflow-y-auto" style={{ borderColor: '#e2e8f0' }}>
      {/* Silver brand strip */}
      <div className="px-4 py-3 border-b" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #94a3b8, #64748b)' }}>
            <Cpu size={12} className="text-white" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Factory Module</p>
            <p className="text-[8px] text-slate-400 font-semibold leading-none">Silver Edition</p>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-0.5">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive ? 'shadow-sm' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
              }`}
              style={isActive ? {
                background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                color: '#334155',
                borderLeft: '3px solid #94a3b8'
              } : {}}
            >
              <item.icon
                className={`w-4 h-4 transition-colors`}
                style={isActive ? { color: '#64748b' } : { color: '#94a3b8' }}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#94a3b8' }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Silver decorative footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: '#e2e8f0' }}>
        <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#64748b' }}>Factory Manager</p>
          <p className="text-[8px] text-slate-400 font-medium mt-0.5">Silver Tier Portal</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
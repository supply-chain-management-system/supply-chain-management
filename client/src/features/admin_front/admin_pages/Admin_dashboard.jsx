import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  ShieldAlert, 
  Package, 
  Truck, 
  ClipboardList, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  Inbox,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';

function Admin_dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/overview');
      setData(res.data);
    } catch (err) {
      console.error("Overview fetch failed:", err);
      setError("Failed to load live overview metrics. Showing offline system stats.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 size={36} className="text-blue-600 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Syncing global telemetry...
        </span>
      </div>
    );
  }

  // Fallback / default data if fetch fails
  const statsData = data || {
    users: { total: 0, by_role: {} },
    companies: { total: 0 },
    invites: { total: 0 },
    managers: { factory: 0, warehouse: 0, logistics: 0, supply: 0, total: 0 },
    suppliers: { total: 0, active: 0 },
    inventory: { items: 0, total_qty: 0 },
    requests: { pending: 0, approved: 0, rejected: 0, total: 0 },
  };

  const kpis = [
    { 
      title: 'Total Companies', 
      value: statsData.companies.total, 
      icon: <Building2 className="text-blue-600" />, 
      gradient: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'border-blue-100',
      path: '/admin/companies'
    },
    { 
      title: 'System Users', 
      value: statsData.users.total, 
      icon: <Users className="text-emerald-600" />, 
      gradient: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-100',
      path: '/admin/sub-managers'
    },
    { 
      title: 'Active Suppliers', 
      value: `${statsData.suppliers.active} / ${statsData.suppliers.total}`, 
      icon: <Truck className="text-amber-600" />, 
      gradient: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-amber-100',
      path: '/admin/factory'
    },
    { 
      title: 'Pending Requests', 
      value: statsData.requests.pending, 
      icon: <ShieldAlert className="text-rose-600" />, 
      gradient: 'from-rose-500/10 to-red-500/10',
      borderColor: 'border-rose-100',
      path: '/admin/factory',
      alert: statsData.requests.pending > 0
    },
  ];

  return (
    <div className="p-8 font-sans">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            System Dashboard
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
            Global administrative cockpit & telemetry
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={fetchOverview}
            className="px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition active:scale-95 shadow-sm"
          >
            Refresh Data
          </button>
          <button 
            onClick={() => navigate('/addmanagers')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl transition active:scale-95 shadow-md shadow-blue-200"
          >
            Invite Manager
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            onClick={() => kpi.path && navigate(kpi.path)}
            className={`cursor-pointer bg-white p-6 border ${kpi.borderColor} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${kpi.gradient} rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300`} />
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                {kpi.title}
              </span>
              <span className="text-2xl font-black text-slate-900 leading-tight">
                {kpi.value}
              </span>
              {kpi.alert && (
                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-700 animate-pulse uppercase tracking-wide">
                  Action Required
                </span>
              )}
            </div>
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all relative z-10">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Role Distribution & Detailed Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Manager & User Distribution */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Users size={14} className="text-indigo-500" /> Administrative Telemetry
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Factory</span>
                <span className="text-xl font-black text-slate-800">{statsData.managers.factory}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Warehouse</span>
                <span className="text-xl font-black text-slate-800">{statsData.managers.warehouse}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Logistics</span>
                <span className="text-xl font-black text-slate-800">{statsData.managers.logistics}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Sourcing</span>
                <span className="text-xl font-black text-slate-800">{statsData.managers.supply}</span>
              </div>
            </div>

            {/* Role bar graph representation */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700">Database Registration distribution</h4>
              {Object.entries(statsData.users.by_role).map(([role, count]) => {
                const total = statsData.users.total || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={role} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-slate-600 font-semibold">{role.replace(/_/g, ' ')}</span>
                      <span className="text-slate-500 font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> Operational Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/add/bussiness-card')}
                className="p-4 text-left border border-slate-150 rounded-2xl hover:bg-slate-50 transition active:scale-95"
              >
                <h4 className="text-xs font-bold text-slate-800 mb-1">Create Container</h4>
                <p className="text-[10px] text-slate-400 leading-tight">Create a new business unit card and scope parameters.</p>
              </button>
              <button 
                onClick={() => navigate('/createwarehouse')}
                className="p-4 text-left border border-slate-150 rounded-2xl hover:bg-slate-50 transition active:scale-95"
              >
                <h4 className="text-xs font-bold text-slate-800 mb-1">Add Warehouse</h4>
                <p className="text-[10px] text-slate-400 leading-tight">Register new warehouse facility schema details.</p>
              </button>
              <button 
                onClick={() => navigate('/managers')}
                className="p-4 text-left border border-slate-150 rounded-2xl hover:bg-slate-50 transition active:scale-95"
              >
                <h4 className="text-xs font-bold text-slate-800 mb-1">Managers Overview</h4>
                <p className="text-[10px] text-slate-400 leading-tight">Review container status lists and invites.</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Invite tokens & low stock alert oversight */}
        <div className="space-y-6">
          
          {/* Inventory Overview Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Package size={14} className="text-amber-500" /> Inventory Oversight
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs font-semibold text-slate-500">Unique SKUs</span>
                <span className="text-sm font-black text-slate-800">{statsData.inventory.items}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-xs font-semibold text-slate-500">Aggregate Stock Qty</span>
                <span className="text-sm font-black text-slate-800">{statsData.inventory.total_qty.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => navigate('/admin/factory')}
                className="w-full mt-2 py-2 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Audit Stock Sheets</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Invitation Logs Status */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <UserPlus size={14} className="text-purple-500" /> Pending Invitations
            </h3>
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Inbox className="text-purple-500" size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                {statsData.invites.total} Active Invitation Link{statsData.invites.total !== 1 ? 's' : ''}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Generated tokens waiting for registration
              </p>
              <button 
                onClick={() => navigate('/admin/factory')}
                className="mt-4 px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-xs font-bold text-white rounded-xl transition active:scale-95 shadow-sm"
              >
                Review Invites
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Admin_dashboard;
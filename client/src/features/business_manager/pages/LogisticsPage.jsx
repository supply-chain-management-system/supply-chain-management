import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLogisticsManagers,
  createLogisticsManager,
  fetchManagerAnalytics,
  removeLogisticsManager,
  setView,
  setSelectedManager,
  setCurrentPage,
  toggleForm,
  updateForm,
  clearToast,
} from '../../../redux/logisticsManagerSlice';

import {
  Truck, BarChart2, Plus, X, ChevronLeft, ChevronRight,
  ArrowLeft, Mail, Phone, Trash2, Users, Route,
  PackageCheck, Clock, Star, AlertCircle, TrendingUp, Grid, List
} from 'lucide-react';

import LMAnalyticsPage from './LMAnalyticsPage';

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */

const SHIFTS = ['Day', 'Night', 'Swing'];
const ROUTES = ['Local', 'Regional', 'Long Haul', 'Last Mile', 'Cross-Border'];

// Banner color driven by ROUTE (mirrors zone logic in warehouse)
const ROUTE_COLOR = {
  'Local':        'from-cyan-600/30 to-cyan-500/10',
  'Regional':     'from-emerald-600/30 to-emerald-500/10',
  'Long Haul':    'from-violet-600/30 to-violet-500/10',
  'Last Mile':    'from-amber-600/30 to-amber-500/10',
  'Cross-Border': 'from-red-600/30 to-red-500/10',
};

const SHIFT_LABEL = {
  Day:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Night: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Swing: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
};

/* ═══════════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
═══════════════════════════════════════════════ */

const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-white/[0.01] rounded-xl border border-white/5 px-3 py-2 min-w-0">
    <Icon size={12} className="text-gray-500 shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-white truncate">{value || '—'}</p>
    </div>
  </div>
);

const StatusDot = ({ pending }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-2 h-2 rounded-full ${pending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`} />
    <span className="text-[10px] font-semibold text-gray-400">{pending ? 'Invite Pending' : 'Active'}</span>
  </div>
);

const Toast = ({ toast, onClear }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClear, 4000);
    return () => clearTimeout(t);
  }, [toast, onClear]);

  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold border transition-all
      ${toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-white' : 'bg-red-950/80 border-red-500/30 text-white'}`}>
      {toast.msg}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MANAGER CARD
═══════════════════════════════════════════════ */

const ManagerCard = ({ manager, onAnalytics, onRemove }) => {
  const bannerColor = ROUTE_COLOR[manager.route] || ROUTE_COLOR['Local'];
  const shiftStyle  = SHIFT_LABEL[manager.shift] || SHIFT_LABEL['Day'];
  const initial     = manager.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div
      className="bg-white/[0.02] border border-white/[0.08] rounded-2xl shadow-sm hover:shadow-lg hover:border-cyan-500/30 transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col"
      onClick={() => onAnalytics(manager)}
    >
      {/* Banner */}
      <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${bannerColor} border-b border-white/5 p-4 flex flex-col justify-end`}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/[0.01]" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/[0.01]" />

        {/* Avatar initial */}
        <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow">{initial}</span>
        </div>

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap justify-end">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${shiftStyle}`}>
            {manager.shift}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300">
            {manager.route}
          </span>
        </div>

        {/* Name */}
        <div>
          <p className="text-white font-bold text-sm drop-shadow truncate">{manager.name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <StatusDot pending={!manager.is_active} />
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={Mail}  label="Email" value={manager.email} />
          <MetaChip icon={Phone} label="Phone" value={manager.phone} />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <button
            onClick={(e) => { e.stopPropagation(); onAnalytics(manager); }}
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <BarChart2 size={12} /> Analytics
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(manager.id); }}
            className="text-[11px] font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SKELETON CARD
═══════════════════════════════════════════════ */

const SkeletonCard = () => (
  <div className="bg-white/[0.02] border border-white/10 rounded-2xl shadow-sm overflow-hidden animate-pulse">
    <div className="h-32 bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-white/5 rounded-full w-1/3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-white/5 rounded-xl" />
        <div className="h-10 bg-white/5 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   LIVE CARD PREVIEW
═══════════════════════════════════════════════ */

const LivePreview = ({ form }) => {
  const bannerColor = ROUTE_COLOR[form.route] || ROUTE_COLOR['Local'];
  const shiftStyle  = SHIFT_LABEL[form.shift] || SHIFT_LABEL['Day'];
  const initial     = form.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/10 shadow-md overflow-hidden w-full max-w-xs mx-auto">
      <div className={`relative h-32 overflow-hidden bg-gradient-to-br ${bannerColor} border-b border-white/5 p-4 flex flex-col justify-end`}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/[0.01]" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/[0.01]" />
        <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{initial}</span>
        </div>
        <div className="absolute top-4 right-4 flex gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${shiftStyle}`}>
            {form.shift || 'Day'}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300">
            {form.route || 'Local'}
          </span>
        </div>
        <div>
          <p className="text-white font-bold text-sm drop-shadow truncate">{form.name || 'Manager Name'}</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <StatusDot pending={true} />
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={Mail}  label="Email" value={form.email || 'email@example.com'} />
          <MetaChip icon={Phone} label="Phone" value={form.phone || '—'} />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   CREATE FORM MODAL
═══════════════════════════════════════════════ */

const inputCls = "w-full border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white/5 text-white placeholder:text-gray-600";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5";

const CreateForm = ({ form, onUpdate, onSubmit, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
    <div className="bg-[#0b1329]/95 border border-white/15 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div>
          <h2 className="font-bold text-white">New Logistics Manager</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Fill details to generate a manager card & send invite</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left — inputs */}
        <div className="p-6 space-y-4 border-r border-white/5">
          <div>
            <label className={labelCls}>Full Name</label>
            <input className={inputCls} placeholder="Jane Doe" value={form.name}
              onChange={e => onUpdate({ name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input className={inputCls} type="email" placeholder="jane@company.com" value={form.email}
              onChange={e => onUpdate({ email: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input className={inputCls} placeholder="+91 98765 43210" value={form.phone}
              onChange={e => onUpdate({ phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Shift</label>
              <select className={inputCls} value={form.shift}
                onChange={e => onUpdate({ shift: e.target.value })}>
                {SHIFTS.map(s => <option key={s} className="bg-[#0b1329]">{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Route Type</label>
              <select className={inputCls} value={form.route}
                onChange={e => onUpdate({ route: e.target.value })}>
                {ROUTES.map(r => <option key={r} className="bg-[#0b1329]">{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Logistics Unit ID</label>
            <input className={inputCls} type="number" placeholder="1" value={form.logistics_id}
              onChange={e => onUpdate({ logistics_id: parseInt(e.target.value) || 1 })} />
          </div>
        </div>

        {/* Right — live preview */}
        <div className="p-6 bg-white/[0.01] flex flex-col items-center justify-center gap-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Live Preview</p>
          <LivePreview form={form} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-white transition-colors">
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || !form.name || !form.email}
          className="px-5 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md shadow-cyan-600/10"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : <Plus size={14} />}
          {loading ? 'Creating…' : 'Create & Send Invite'}
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   LIST VIEW TABLE
═══════════════════════════════════════════════ */
const ManagersTable = ({ managers, onRowClick, onRemove }) => {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Manager Name</th>
              <th className="px-6 py-4">Route Type</th>
              <th className="px-6 py-4">Shift</th>
              <th className="px-6 py-4">Contact Info</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {managers.map(manager => {
              const bannerColor = ROUTE_COLOR[manager.route] || ROUTE_COLOR['Local'];
              const shiftStyle = SHIFT_LABEL[manager.shift] || SHIFT_LABEL['Day'];

              return (
                <tr
                  key={manager.id}
                  onClick={() => onRowClick(manager)}
                  className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-white text-xs font-bold">
                      {manager.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {manager.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold bg-white/5 border border-white/10 text-gray-300">
                      {manager.route}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold border ${shiftStyle}`}>
                      {manager.shift}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <Mail size={10} className="text-gray-500" />
                        {manager.email}
                      </div>
                      {manager.phone && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Phone size={10} className="text-gray-500" />
                          {manager.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDot pending={!manager.is_active} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(manager.id); }}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                      title="Remove Manager"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */

const PAGE_SIZE = 9;

const LogisticsManagerPage = () => {
  const dispatch = useDispatch();
  const {
    managers, total, currentPage,
    form, isFormOpen,
    selectedManager, analytics,
    view, loading, inviteLoading, analyticsLoading,
    toast,
  } = useSelector(s => s.logisticsManager);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* initial load */
  useEffect(() => {
    dispatch(fetchLogisticsManagers({ page: 1, size: PAGE_SIZE }));
  }, [dispatch]);

  /* page change */
  useEffect(() => {
    if (view === 'roster') {
      dispatch(fetchLogisticsManagers({ page: currentPage, size: PAGE_SIZE }));
    }
  }, [currentPage, view, dispatch]);

  const handleAnalytics = useCallback((manager) => {
    dispatch(setSelectedManager(manager));
    dispatch(fetchManagerAnalytics(manager.id));
  }, [dispatch]);

  const handleRemove = useCallback((id) => {
    if (window.confirm('Remove this manager?')) {
      dispatch(removeLogisticsManager(id));
    }
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    dispatch(createLogisticsManager(form));
  }, [dispatch, form]);

  /* ── Analytics view ── */
  if (view === 'analytics' && selectedManager) {
    return (
      <div className="space-y-6">
        <LMAnalyticsPage
          manager={selectedManager}
          analytics={analytics}
          loading={analyticsLoading}
          onBack={() => dispatch(setView('roster'))}
          onRemove={handleRemove}
        />
        <Toast toast={toast} onClear={() => dispatch(clearToast())} />
      </div>
    );
  }

  /* ── Roster view ── */
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Logistics Control: Fleet & Routes</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">
            {total > 0 ? `${total} manager${total !== 1 ? 's' : ''} active across all routes` : 'No managers yet'}
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Toggle View mode */}
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-400 hover:text-white'}`}
              title="Grid Cards"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-600/20' : 'text-gray-400 hover:text-white'}`}
              title="Tabular List"
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={() => dispatch(toggleForm())}
            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/10"
          >
            <Plus size={16} /> Add Manager
          </button>
        </div>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Managers', value: total,                              icon: Users,        color: 'text-cyan-400'    },
          { label: 'Active Routes',  value: ROUTES.length,                      icon: Route,        color: 'text-emerald-400' },
          { label: 'Day Shift',      value: managers.filter(m=>m.shift==='Day').length,   icon: Truck, color: 'text-amber-400'   },
          { label: 'Night Shift',    value: managers.filter(m=>m.shift==='Night').length, icon: PackageCheck, color: 'text-indigo-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 shadow-sm">
            <s.icon size={18} className={`mb-3 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grid or List content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : managers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
            <Truck size={28} className="text-cyan-400" />
          </div>
          <h3 className="font-bold text-white text-lg">No managers yet</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-xs">
            Add your first logistics manager to get started managing fleet operations.
          </p>
          <button
            onClick={() => dispatch(toggleForm())}
            className="mt-5 flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/10"
          >
            <Plus size={14} /> Add First Manager
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {managers.map(m => (
            <ManagerCard
              key={m.id}
              manager={m}
              onAnalytics={handleAnalytics}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <ManagersTable
          managers={managers}
          onRowClick={handleAnalytics}
          onRemove={handleRemove}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            disabled={currentPage <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 disabled:opacity-30 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create form modal */}
      {isFormOpen && (
        <CreateForm
          form={form}
          onUpdate={(patch) => dispatch(updateForm(patch))}
          onSubmit={handleSubmit}
          onClose={() => dispatch(toggleForm())}
          loading={inviteLoading}
        />
      )}

      <Toast toast={toast} onClear={() => dispatch(clearToast())} />
    </div>
  );
};

export default LogisticsManagerPage;
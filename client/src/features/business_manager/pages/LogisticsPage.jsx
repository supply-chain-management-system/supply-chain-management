import { useEffect, useCallback } from 'react';
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
} from '../../../redux/logisticsManagerSlice'; // adjust path to your store

import {
  Truck, BarChart2, Plus, X, ChevronLeft, ChevronRight,
  ArrowLeft, Mail, Phone, Trash2, Users, Route,
  PackageCheck, Clock, Star, AlertCircle, TrendingUp,
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */

const SHIFTS = ['Day', 'Night', 'Swing'];
const ROUTES = ['Local', 'Regional', 'Long Haul', 'Last Mile', 'Cross-Border'];

// Banner color driven by ROUTE (mirrors zone logic in warehouse)
const ROUTE_COLOR = {
  'Local':        '#1D6FA4',   // ocean blue
  'Regional':     '#1A7A4A',   // forest green
  'Long Haul':    '#7C3AED',   // deep violet
  'Last Mile':    '#B45309',   // amber-brown
  'Cross-Border': '#B91C1C',   // crimson
};

const SHIFT_LABEL = {
  Day:   { bg: 'bg-amber-400/90',  text: 'text-amber-900'  },
  Night: { bg: 'bg-indigo-500/90', text: 'text-white'       },
  Swing: { bg: 'bg-purple-500/90', text: 'text-white'       },
};

/* ═══════════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
═══════════════════════════════════════════════ */

const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100 px-3 py-2 min-w-0">
    <Icon size={12} className="text-gray-400 shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-700 truncate">{value || '—'}</p>
    </div>
  </div>
);

const StatusDot = ({ pending }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-2 h-2 rounded-full ${pending ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
    <span className="text-[10px] font-semibold text-gray-500">{pending ? 'Invite Pending' : 'Active'}</span>
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
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all
      ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
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
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer group"
      onClick={() => onAnalytics(manager)}
    >
      {/* Banner */}
      <div className="relative h-32 overflow-hidden" style={{ backgroundColor: bannerColor }}>
        {/* decorative blobs */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
        {/* bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />

        {/* Avatar initial */}
        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow">{initial}</span>
        </div>

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap justify-end">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${shiftStyle.bg} ${shiftStyle.text}`}>
            {manager.shift}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 text-gray-700">
            {manager.route}
          </span>
        </div>

        {/* Name */}
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-white font-bold text-sm drop-shadow truncate">{manager.name}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <StatusDot pending={!manager.is_active} />
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={Mail}  label="Email" value={manager.email} />
          <MetaChip icon={Phone} label="Phone" value={manager.phone} />
        </div>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAnalytics(manager); }}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <BarChart2 size={12} /> Analytics
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(manager.id); }}
            className="text-[11px] font-semibold text-red-400 hover:text-red-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-32 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-gray-100 rounded-xl" />
        <div className="h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   LIVE CARD PREVIEW (for create form)
═══════════════════════════════════════════════ */

const LivePreview = ({ form }) => {
  const bannerColor = ROUTE_COLOR[form.route] || ROUTE_COLOR['Local'];
  const shiftStyle  = SHIFT_LABEL[form.shift] || SHIFT_LABEL['Day'];
  const initial     = form.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden w-full max-w-xs mx-auto">
      <div className="relative h-32 overflow-hidden" style={{ backgroundColor: bannerColor }}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{initial}</span>
        </div>
        <div className="absolute top-4 right-4 flex gap-1.5">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${shiftStyle.bg} ${shiftStyle.text}`}>
            {form.shift || 'Day'}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 text-gray-700">
            {form.route || 'Local'}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
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

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-gray-300";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5";

const CreateForm = ({ form, onUpdate, onSubmit, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-800">New Logistics Manager</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Fill details to generate a manager card & send invite</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Body — split layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left — inputs */}
        <div className="p-6 space-y-4 border-r border-gray-100">
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
                {SHIFTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Route Type</label>
              <select className={inputCls} value={form.route}
                onChange={e => onUpdate({ route: e.target.value })}>
                {ROUTES.map(r => <option key={r}>{r}</option>)}
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
        <div className="p-6 bg-gray-50/50 flex flex-col items-center justify-center gap-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Live Preview</p>
          <LivePreview form={form} />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || !form.name || !form.email}
          className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
   ANALYTICS VIEW
═══════════════════════════════════════════════ */

const AnalyticsView = ({ manager, analytics, loading, onBack, onRemove }) => {
  const bannerColor = ROUTE_COLOR[manager.route] || ROUTE_COLOR['Local'];

  const kpis = analytics ? [
    { label: 'Deliveries Managed',  value: analytics.total_deliveries_managed ?? '—', icon: Truck,       color: 'text-blue-600'  },
    { label: 'On-Time Rate',        value: analytics.on_time_rate != null ? `${analytics.on_time_rate}%` : '—', icon: Clock, color: 'text-emerald-600' },
    { label: 'Fleet Utilization',   value: analytics.fleet_utilization != null ? `${analytics.fleet_utilization}%` : '—', icon: TrendingUp, color: 'text-violet-600' },
    { label: 'Pending Shipments',   value: analytics.pending_shipments ?? '—', icon: AlertCircle, color: 'text-amber-600' },
    { label: 'Avg. Transit Days',   value: analytics.avg_transit_days != null ? `${analytics.avg_transit_days}d` : '—', icon: Route, color: 'text-slate-600' },
    { label: 'Reliability Score',   value: analytics.reliability != null ? `${analytics.reliability}%` : '—', icon: Star, color: 'text-orange-500' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} /> Back to Roster
      </button>

      {/* Manager card preview + meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="relative h-36 overflow-hidden" style={{ backgroundColor: bannerColor }}>
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-xl">{manager.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="absolute top-4 right-4 flex gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${(SHIFT_LABEL[manager.shift] || SHIFT_LABEL.Day).bg} ${(SHIFT_LABEL[manager.shift] || SHIFT_LABEL.Day).text}`}>
                {manager.shift}
              </span>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-white/90 text-gray-700">
                {manager.route}
              </span>
            </div>
            <div className="absolute bottom-3 left-4 right-4">
              <p className="text-white font-bold drop-shadow">{manager.name}</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <StatusDot pending={!manager.is_active} />
            <div className="grid grid-cols-2 gap-2">
              <MetaChip icon={Mail}  label="Email" value={manager.email} />
              <MetaChip icon={Phone} label="Phone" value={manager.phone} />
            </div>
            <button onClick={() => onRemove(manager.id)}
              className="w-full mt-2 text-xs font-semibold text-red-500 hover:text-red-700 flex items-center justify-center gap-1.5 py-2 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
              <Trash2 size={12} /> Remove Manager
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                  <div className="h-4 w-4 bg-gray-200 rounded mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {kpis.map((k, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <k.icon size={18} className={`mb-3 ${k.color}`} />
                  <p className="text-2xl font-bold text-gray-800">{k.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{k.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
        <p className="text-xs text-slate-500 leading-relaxed">
          Analytics are derived from the <span className="font-mono font-semibold text-slate-700">shipment_routes</span> and{' '}
          <span className="font-mono font-semibold text-slate-700">logistics_manager</span> tables.
          Fleet utilization and transit metrics update daily via the backend analytics endpoint.
        </p>
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
        <AnalyticsView
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Logistics Managers</h1>
          <p className="text-slate-400 text-sm mt-1">
            {total > 0 ? `${total} manager${total !== 1 ? 's' : ''} across all routes` : 'No managers yet'}
          </p>
        </div>
        <button
          onClick={() => dispatch(toggleForm())}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Add Manager
        </button>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Managers', value: total,                              icon: Users,        color: 'text-blue-600'    },
          { label: 'Active Routes',  value: ROUTES.length,                      icon: Route,        color: 'text-emerald-600' },
          { label: 'Day Shift',      value: managers.filter(m=>m.shift==='Day').length,   icon: Truck, color: 'text-amber-600'   },
          { label: 'Night Shift',    value: managers.filter(m=>m.shift==='Night').length, icon: PackageCheck, color: 'text-indigo-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <s.icon size={18} className={`mb-3 ${s.color}`} />
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : managers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Truck size={28} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-700 text-lg">No managers yet</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            Add your first logistics manager to get started managing fleet operations.
          </p>
          <button
            onClick={() => dispatch(toggleForm())}
            className="mt-5 flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus size={14} /> Add First Manager
          </button>
        </div>
      ) : (
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
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
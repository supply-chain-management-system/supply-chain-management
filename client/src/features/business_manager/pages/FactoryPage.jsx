import { useEffect, useState, useCallback } from 'react';
import {
  Users, Mail, Phone, Trash2, Plus, X, ArrowRight,
  Loader2, ChevronLeft, ChevronRight, Zap, Package,
  Timer, CheckCircle2, ShieldAlert, RefreshCw, AlertCircle,
} from 'lucide-react';

// ✅ Your existing axios instance — handles auth, refresh tokens, credentials
import api from '../../../api/api';

// ─── API calls (thin wrappers — axios returns { data } automatically) ─────
const FM = '/business-manager/factory-managers/';

const fetchList      = (page, size) => api.get(FM, { params: { page, size } });
const fetchCount     = ()           => api.get(`${FM}/count`);
const postCreate     = (payload)    => api.post(FM, payload);
const deleteOne      = (id)         => api.delete(`${FM}/${id}`);
const getAnalytics   = (id)         => api.get(`${FM}/${id}/analytics`);

// ─── Constants ────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 9;

const SHIFT_COLOR = {
  Day:   { banner: '#C2581A', badge: 'bg-orange-50 text-orange-600 border-orange-200' },
  Night: { banner: '#3B4FA8', badge: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  Swing: { banner: '#6D3FAB', badge: 'bg-purple-50 text-purple-600 border-purple-200' },
};

const DEPT_COLOR = {
  Assembly:          'bg-blue-50   text-blue-700   border-blue-200',
  'Quality Control': 'bg-green-50  text-green-700  border-green-200',
  Logistics:         'bg-amber-50  text-amber-700  border-amber-200',
};

const EMPTY_FORM = {
  name: '', email: '', phone: '',
  shift: 'Day', department: 'Assembly',
  factory_id: 1, business_id: 1,
};

// ─── Error extractor — works for both axios and network errors ─────────────
const errMsg = (err) =>
  err.response?.data?.detail || err.message || 'Something went wrong.';

// ─── Helpers ──────────────────────────────────────────────────────────────
const MetaChip = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
    <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300">{label}</p>
      <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

const StatusDot = ({ isUsed }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${isUsed ? 'text-emerald-600' : 'text-amber-500'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${isUsed ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
    {isUsed ? 'Active' : 'Invite Sent'}
  </span>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    <div className="h-32 bg-slate-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-slate-100 rounded w-2/3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-10 bg-slate-100 rounded-xl" />
        <div className="h-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  </div>
);

// Self-clearing toast
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${
      toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
    }`}>
      {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
    </div>
  );
};

// ─── Manager Card ─────────────────────────────────────────────────────────
const ManagerCard = ({ fm, isSelected, onCardClick, onRemove, removing }) => {
  const shift     = fm.shift || 'Day';
  const shiftMeta = SHIFT_COLOR[shift] ?? SHIFT_COLOR.Day;
  const deptCls   = DEPT_COLOR[fm.department] ?? 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div
      onClick={() => onCardClick(fm)}
      className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer
        ${isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'}
        ${removing  ? 'opacity-40 pointer-events-none scale-95' : ''}`}
    >
      {/* coloured banner */}
      <div
        className="relative h-32 flex flex-col justify-end px-5 pb-4 flex-shrink-0"
        style={{ background: shiftMeta.banner }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-3 right-12 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        <button
          onClick={(e) => onRemove(e, fm.id)}
          className="absolute top-3 right-3 text-white/40 hover:text-red-300 transition-colors z-10"
          title="Remove manager"
        >
          {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>

        <div className="absolute top-3 left-5 w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-sm">
          {fm.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 bg-white/90 ${shiftMeta.badge}`}>
            {shift} Shift
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 bg-white/90 ${deptCls}`}>
            {fm.department}
          </span>
        </div>
        <h2 className="text-white font-bold text-lg leading-tight drop-shadow">{fm.name}</h2>
      </div>

      {/* body */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
          <StatusDot isUsed={fm.is_used} />
          {fm.role && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {fm.role.replace('_', ' ')}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={<Mail size={12} />}  label="Email" value={fm.email} />
          <MetaChip icon={<Phone size={12} />} label="Phone" value={fm.phone} />
        </div>
        {fm.business_id && (
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-300 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-gray-200" />
            Business #{fm.business_id}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Create Form ──────────────────────────────────────────────────────────
const CreateForm = ({ form, setForm, loading, onSubmit, onClose }) => {
  const shiftMeta = SHIFT_COLOR[form.shift] ?? SHIFT_COLOR.Day;
  const deptCls   = DEPT_COLOR[form.department] ?? 'bg-gray-50 text-gray-600 border-gray-200';

  const field = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const inputCls  = "w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";
  const selectCls = "w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer";
  const labelCls  = "block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-bold text-gray-800">New Factory Manager</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Card saved to backend · invite email dispatched via n8n
          </p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* left: fields */}
        <div className="p-6 border-r border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Fill in details</p>
          <form id="create-fm-form" onSubmit={onSubmit} className="space-y-3">

            <div>
              <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
              <input required type="text" placeholder="e.g. Sarah Chen" className={inputCls} {...field('name')} />
            </div>

            <div>
              <label className={labelCls}>Work Email <span className="text-red-400">*</span></label>
              <input required type="email" placeholder="sarah@factory.com" className={inputCls} {...field('email')} />
            </div>

            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="text" placeholder="+1 555 000 0000" className={inputCls} {...field('phone')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Shift</label>
                <select className={selectCls} {...field('shift')}>
                  <option>Day</option><option>Night</option><option>Swing</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <select className={selectCls} {...field('department')}>
                  <option>Assembly</option><option>Quality Control</option><option>Logistics</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Factory ID</label>
                <input type="number" min="1" className={inputCls} {...field('factory_id')} />
              </div>
              <div>
                <label className={labelCls}>Business ID</label>
                <input type="number" min="1" className={inputCls} {...field('business_id')} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.name?.trim() || !form.email?.trim()}
              className="w-full h-10 mt-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all active:scale-95"
            >
              {loading
                ? <><Loader2 size={13} className="animate-spin" /> Creating…</>
                : <><ArrowRight size={13} /> Create Card & Send Invite</>}
            </button>
          </form>
        </div>

        {/* right: live preview */}
        <div className="p-6 bg-gray-50/60 flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live preview</p>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative h-28 flex flex-col justify-end px-4 pb-3" style={{ background: shiftMeta.banner }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute top-2 right-10 w-8 h-8 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              <div className="absolute top-3 left-4 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white font-black text-sm">
                {form.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/90 ${shiftMeta.badge}`}>
                  {form.shift} Shift
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/90 ${deptCls}`}>
                  {form.department}
                </span>
              </div>
              <h2 className="text-white font-bold text-base leading-tight drop-shadow">
                {form.name?.trim() || <span className="opacity-40 font-normal italic">Manager name</span>}
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MetaChip icon={<Mail size={11} />}  label="Email" value={form.email || '—'} />
                <MetaChip icon={<Phone size={11} />} label="Phone" value={form.phone || '—'} />
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Invite Sent
                </span>
                {form.business_id && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">
                    Biz #{form.business_id}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center">Preview updates as you type</p>
        </div>
      </div>
    </div>
  );
};

// ─── Analytics Panel ──────────────────────────────────────────────────────
const AnalyticsView = ({ manager, analytics, loading, onBack }) => {
  const KPIs = [
    { label: 'Efficiency',     value: analytics?.efficiency_score != null ? `${analytics.efficiency_score}%` : '—', icon: <Zap size={18} />,         color: 'text-yellow-500' },
    { label: 'Batches Done',   value: analytics?.batches_completed ?? '—',                                          icon: <Package size={18} />,      color: 'text-blue-500'   },
    { label: 'Avg Cycle Time', value: analytics?.avg_cycle_time ?? '—',                                            icon: <Timer size={18} />,        color: 'text-purple-500' },
    { label: 'Reliability',    value: analytics?.reliability ?? '—',                                               icon: <CheckCircle2 size={18} />, color: 'text-emerald-500'},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-800 transition-colors text-sm font-semibold flex items-center gap-1">
          <ChevronLeft size={16} /> Back
        </button>
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
          style={{ background: SHIFT_COLOR[manager.shift]?.banner ?? '#185FA5' }}
        >
          {manager.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-slate-800 truncate">Performance: {manager.name}</h2>
          <p className="text-xs text-slate-400">{manager.department} · {manager.shift} Shift · {manager.email}</p>
        </div>
        <div className="ml-auto flex-shrink-0"><StatusDot isUsed={manager.is_used} /></div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-44 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPIs.map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <span className={kpi.color}>{kpi.icon}</span>
                <p className="text-2xl font-black text-slate-800 mt-2">{kpi.value}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Manager Efficiency</p>
              <h3 className="text-5xl font-black">{analytics?.efficiency_score ?? '—'}%</h3>
              <div className="mt-8 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(analytics?.efficiency_score ?? 0, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-4 uppercase font-bold tracking-widest">
                Reliability: {analytics?.reliability ?? '—'}
              </p>
              <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
                Registered: {analytics?.is_registered ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Production Feed</h3>
              <p className="text-slate-400 text-sm italic">
                Live production data for {manager.name} will populate once they register and begin logging batches.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                  <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Package size={11} /> Total Batches
                  </p>
                  <p className="text-2xl font-black text-slate-800 mt-1">{analytics?.total_batches ?? '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center gap-1">
                    <ShieldAlert size={11} /> Status
                  </p>
                  <StatusDot isUsed={manager.is_used} />
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Role</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{manager.role?.replace('_', ' ')}</p>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Business ID</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">#{manager.business_id ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
const FactoryPage = () => {
  const [managers, setManagers]       = useState([]);
  const [total, setTotal]             = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]         = useState(false);
  const [listError, setListError]     = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [creating, setCreating]     = useState(false);

  const [selectedManager, setSelectedManager]   = useState(null);
  const [analytics, setAnalytics]               = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [view, setView]                         = useState('roster');

  const [removingIds, setRemovingIds] = useState(new Set());
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // ── FETCH ─────────────────────────────────────────────────
  const loadManagers = useCallback(async (page = 1) => {
    setLoading(true);
    setListError(null);
    try {
      const [listRes, countRes] = await Promise.all([
        fetchList(page, ITEMS_PER_PAGE),
        fetchCount(),
      ]);
      setManagers(listRes.data);           // axios unwraps .data for you
      setTotal(countRes.data.total ?? 0);
    } catch (err) {
      const msg = errMsg(err);
      setListError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManagers(currentPage);
  }, [currentPage, loadManagers]);

  // ── CREATE ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data: created } = await postCreate({
        name:        form.name.trim(),
        email:       form.email.trim(),
        phone:       form.phone.trim() || null,
        shift:       form.shift,
        department:  form.department,
        factory_id:  Number(form.factory_id),
        business_id: Number(form.business_id),
      });
      setManagers(prev => [created, ...prev]);
      setTotal(prev => prev + 1);
      setForm(EMPTY_FORM);
      setIsFormOpen(false);
      showToast(`${created.name} added — invite sent to ${created.email}!`);
    } catch (err) {
      showToast(errMsg(err), 'error');
    } finally {
      setCreating(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleRemove = async (e, managerId) => {
    e.stopPropagation();
    if (!window.confirm('Remove this manager? This cannot be undone.')) return;

    setRemovingIds(prev => new Set(prev).add(managerId));
    try {
      await deleteOne(managerId);
      setManagers(prev => prev.filter(m => m.id !== managerId));
      setTotal(prev => prev - 1);
      if (selectedManager?.id === managerId) {
        setSelectedManager(null);
        setView('roster');
      }
      showToast('Manager removed successfully.');
    } catch (err) {
      showToast(errMsg(err), 'error');
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(managerId);
        return next;
      });
    }
  };

  // ── ANALYTICS ─────────────────────────────────────────────
  const handleCardClick = async (manager) => {
    setSelectedManager(manager);
    setView('analytics');
    setAnalyticsLoading(true);
    setAnalytics(null);
    try {
      const { data } = await getAnalytics(manager.id);
      setAnalytics(data);
    } catch (err) {
      showToast(errMsg(err), 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Factory Control: Team & Performance
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {total} Factory Manager{total !== 1 ? 's' : ''}
            {listError && <span className="ml-2 text-red-400 text-xs font-semibold">· {listError}</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadManagers(currentPage)}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 transition disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setView('roster')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                view === 'roster' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              TEAM ROSTER
            </button>
            <button
              onClick={() => { if (selectedManager) setView('analytics'); }}
              disabled={!selectedManager}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                view === 'analytics' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'
              } ${!selectedManager ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              ANALYTICS
            </button>
          </div>
        </div>
      </div>

      {/* ROSTER */}
      {view === 'roster' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Manager Directory</h2>
            <button
              onClick={() => { setIsFormOpen(v => !v); setForm(EMPTY_FORM); }}
              className="group flex items-center gap-2 bg-slate-900 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl transition-all duration-150"
            >
              <span className="w-5 h-5 bg-white/15 rounded-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-200">
                {isFormOpen ? <X size={12} /> : <Plus size={12} />}
              </span>
              {isFormOpen ? 'Close' : 'Add Factory Manager'}
            </button>
          </div>

          {isFormOpen && (
            <CreateForm
              form={form}
              setForm={setForm}
              loading={creating}
              onSubmit={handleSubmit}
              onClose={() => { setIsFormOpen(false); setForm(EMPTY_FORM); }}
            />
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Users size={28} className="text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">No factory managers yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Factory Manager" to create the first card</p>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
              >
                <Plus size={14} /> Add Factory Manager
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {managers.map(fm => (
                <ManagerCard
                  key={fm.id}
                  fm={fm}
                  isSelected={selectedManager?.id === fm.id}
                  onCardClick={handleCardClick}
                  onRemove={handleRemove}
                  removing={removingIds.has(fm.id)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:border-blue-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:border-blue-300 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {view === 'analytics' && selectedManager && (
        <AnalyticsView
          manager={selectedManager}
          analytics={analytics}
          loading={analyticsLoading}
          onBack={() => setView('roster')}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default FactoryPage;
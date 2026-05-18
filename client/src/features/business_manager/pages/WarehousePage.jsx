import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWarehouseManagers,
  createWarehouseManager,
  fetchManagerAnalytics,
  removeWarehouseManager,
  setView,
  setSelectedManager,
  setCurrentPage,
  toggleForm,
  updateForm,
  clearToast,
} from '../../../redux/warehouseManagerSlice';
import {
  Users, Mail, Phone, Trash2, Plus, X, ArrowRight,
  Loader2, ChevronLeft, ChevronRight,
  Package, Warehouse, Truck, CheckCircle2, BarChart3, ShieldCheck,
} from 'lucide-react';

import WMAnalyticsPage from './WMAnalyticsPage';

const ITEMS_PER_PAGE = 9;

/* ── zone colour map (banner + badge) ────────────────────── */
const ZONE_COLOR = {
  'Dry Goods':     { banner: '#B45309', badge: 'bg-amber-50  text-amber-700  border-amber-200'  },
  'Cold Storage':  { banner: '#0369A1', badge: 'bg-sky-50    text-sky-700    border-sky-200'    },
  'Inbound':       { banner: '#15803D', badge: 'bg-green-50  text-green-700  border-green-200'  },
  'Outbound':      { banner: '#7C3AED', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  'Hazmat':        { banner: '#B91C1C', badge: 'bg-red-50    text-red-700    border-red-200'    },
  'General Storage':{ banner: '#475569', badge: 'bg-slate-50  text-slate-700  border-slate-200' },
};

const SHIFT_BADGE = {
  Day:   'bg-orange-50 text-orange-600 border-orange-200',
  Night: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Swing: 'bg-purple-50 text-purple-600 border-purple-200',
};

const ZONES  = Object.keys(ZONE_COLOR);
const SHIFTS = ['Day', 'Night', 'Swing'];

/* ══════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════
   Warehouse Manager Card — BizCard style
═══════════════════════════════════════════════════════════ */
const ManagerCard = ({ wm, isSelected, onCardClick, onRemove }) => {
  const zone      = wm.department || 'General Storage';   // backend maps zone → department
  const shift     = wm.shift || 'Day';
  const zoneMeta  = ZONE_COLOR[zone]  ?? ZONE_COLOR['General Storage'];
  const shiftCls  = SHIFT_BADGE[shift] ?? SHIFT_BADGE.Day;

  return (
    <div
      onClick={() => onCardClick(wm)}
      className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer ${
        isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
      }`}
    >
      {/* coloured banner */}
      <div
        className="relative h-32 flex flex-col justify-end px-5 pb-4 flex-shrink-0"
        style={{ background: zoneMeta.banner }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-3 right-12 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* remove */}
        <button
          onClick={(e) => onRemove(e, wm.id)}
          className="absolute top-3 right-3 text-white/40 hover:text-red-300 transition-colors z-10"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>

        {/* avatar */}
        <div className="absolute top-3 left-5 w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-sm">
          {wm.name.charAt(0).toUpperCase()}
        </div>

        {/* badges */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 bg-white/90 ${zoneMeta.badge}`}>
            {zone}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-0.5 bg-white/90 ${shiftCls}`}>
            {shift} Shift
          </span>
        </div>

        <h2 className="text-white font-bold text-lg leading-tight drop-shadow">{wm.name}</h2>
      </div>

      {/* body */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <div className="pb-3 border-b border-gray-100">
          <StatusDot isUsed={wm.is_used} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={<Mail size={12} />}  label="Email" value={wm.email} />
          <MetaChip icon={<Phone size={12} />} label="Phone" value={wm.phone} />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   Create form — fields left · live card preview right
═══════════════════════════════════════════════════════════ */
const CreateForm = ({ form, inviteLoading, onSubmit, onClose, dispatch }) => {
  const zone     = form.zone  || 'Dry Goods';
  const shift    = form.shift || 'Day';
  const zoneMeta = ZONE_COLOR[zone]  ?? ZONE_COLOR['General Storage'];
  const shiftCls = SHIFT_BADGE[shift] ?? SHIFT_BADGE.Day;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg">

      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-bold text-gray-800">New Warehouse Manager</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Card is created instantly & invite email is sent</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* ── LEFT: fields ── */}
        <div className="p-6 border-r border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Fill in details</p>
          <form onSubmit={onSubmit} id="create-whm-form" className="space-y-3">

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                required type="text" placeholder="e.g. Ravi Sharma"
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                value={form.name}
                onChange={e => dispatch(updateForm({ name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Work Email <span className="text-red-400">*</span>
              </label>
              <input
                required type="email" placeholder="ravi@warehouse.com"
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                value={form.email}
                onChange={e => dispatch(updateForm({ email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone Number</label>
              <input
                type="text" placeholder="+91 98000 00000"
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                value={form.phone}
                onChange={e => dispatch(updateForm({ phone: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Shift</label>
                <select
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
                  value={form.shift}
                  onChange={e => dispatch(updateForm({ shift: e.target.value }))}
                >
                  {SHIFTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Zone</label>
                <select
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
                  value={form.zone}
                  onChange={e => dispatch(updateForm({ zone: e.target.value }))}
                >
                  {ZONES.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Warehouse ID</label>
              <input
                type="number" min="1" placeholder="1"
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                value={form.warehouse_id}
                onChange={e => dispatch(updateForm({ warehouse_id: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <button
              type="submit"
              form="create-whm-form"
              disabled={inviteLoading || !form.name?.trim() || !form.email?.trim()}
              className="w-full h-10 mt-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all active:scale-95"
            >
              {inviteLoading
                ? <><Loader2 size={13} className="animate-spin" /> Creating…</>
                : <><ArrowRight size={13} /> Create Card & Send Invite</>}
            </button>
          </form>
        </div>

        {/* ── RIGHT: live preview ── */}
        <div className="p-6 bg-gray-50/60 flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live preview</p>

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div
              className="relative h-28 flex flex-col justify-end px-4 pb-3"
              style={{ background: zoneMeta.banner }}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute top-2 right-10 w-8 h-8 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-4 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white font-black text-sm">
                {form.name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/90 ${zoneMeta.badge}`}>
                  {zone}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/90 ${shiftCls}`}>
                  {shift} Shift
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
              <div className="pt-2 border-t border-gray-100">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Invite Sent
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center">Preview updates as you type</p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const WarehouseManagerPage = () => {
  const dispatch = useDispatch();
  const {
    managers, total, currentPage,
    form, isFormOpen,
    selectedManager, analytics,
    view, loading, inviteLoading, analyticsLoading,
    toast,
  } = useSelector(state => state.warehouseManager);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    dispatch(fetchWarehouseManagers({ page: currentPage, size: ITEMS_PER_PAGE }));
  }, [currentPage, dispatch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch(clearToast()), 3500);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  const handleCardClick = (wm) => {
    dispatch(setSelectedManager(wm));
    dispatch(fetchManagerAnalytics(wm.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createWarehouseManager(form));
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Remove this manager?')) return;
    dispatch(removeWarehouseManager(id));
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Warehouse Control: Team & Performance
          </h1>
          <p className="text-slate-400 text-sm">
            {total} Warehouse Manager{total !== 1 ? 's' : ''} · Central Hub — Kochi (WH-01)
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
          <button
            onClick={() => dispatch(setView('roster'))}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              view === 'roster' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            TEAM ROSTER
          </button>
          <button
            onClick={() => { if (selectedManager) dispatch(setView('analytics')); }}
            disabled={!selectedManager}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              view === 'analytics' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'
            } ${!selectedManager ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            ANALYTICS
          </button>
        </div>
      </div>

      {/* ══ ROSTER VIEW ══ */}
      {view === 'roster' && (
        <div className="space-y-6">

          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">
              Manager Directory
            </h2>
            <button
              onClick={() => dispatch(toggleForm())}
              className="group flex items-center gap-2 bg-slate-900 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl transition-all duration-150"
            >
              <span className="w-5 h-5 bg-white/15 rounded-md flex items-center justify-center group-hover:rotate-90 transition-transform duration-200">
                {isFormOpen ? <X size={12} /> : <Plus size={12} />}
              </span>
              {isFormOpen ? 'Close' : 'Add Warehouse Manager'}
            </button>
          </div>

          {isFormOpen && (
            <CreateForm
              form={form}
              inviteLoading={inviteLoading}
              onSubmit={handleSubmit}
              onClose={() => dispatch(toggleForm())}
              dispatch={dispatch}
            />
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Warehouse size={28} className="text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">No warehouse managers yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Warehouse Manager" to create the first card</p>
              </div>
              <button
                onClick={() => dispatch(toggleForm())}
                className="flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition"
              >
                <Plus size={14} /> Add Warehouse Manager
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {managers.map(wm => (
                <ManagerCard
                  key={wm.id}
                  wm={wm}
                  isSelected={selectedManager?.id === wm.id}
                  onCardClick={handleCardClick}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:border-blue-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:border-blue-300 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ ANALYTICS VIEW ══ */}
      {view === 'analytics' && selectedManager && (
        <WMAnalyticsPage
          manager={selectedManager}
          analytics={analytics}
          loading={analyticsLoading}
          onBack={() => dispatch(setView('roster'))}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default WarehouseManagerPage;
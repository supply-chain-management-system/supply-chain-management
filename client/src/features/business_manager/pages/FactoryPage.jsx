import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFactoryManagers,
  createFactoryManager,
  fetchManagerAnalytics,
  removeFactoryManager,
  setView,
  setSelectedManager,
  setCurrentPage,
  toggleForm,
  updateForm,
  clearToast,
} from '../../../redux/factoryManagerSlice';
import {
  Users, Clock, Mail, Phone, Trash2,
  Plus, X, ArrowRight, Loader2,
  ChevronLeft, ChevronRight, Zap,
  Package, Timer, CheckCircle2, ShieldAlert,
} from 'lucide-react';

const ITEMS_PER_PAGE = 9;

/* ── shift colour map ─────────────────────────────────────── */
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
   Manager card — BizCard style
═══════════════════════════════════════════════════════════ */
const ManagerCard = ({ fm, isSelected, onCardClick, onRemove }) => {
  const shift     = fm.shift || 'Day';
  const shiftMeta = SHIFT_COLOR[shift] ?? SHIFT_COLOR.Day;
  const deptCls   = DEPT_COLOR[fm.department] ?? 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div
      onClick={() => onCardClick(fm)}
      className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer ${
        isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
      }`}
    >
      {/* coloured banner */}
      <div
        className="relative h-32 flex flex-col justify-end px-5 pb-4 flex-shrink-0"
        style={{ background: shiftMeta.banner }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-3 right-12 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* remove */}
        <button
          onClick={(e) => onRemove(e, fm.id)}
          className="absolute top-3 right-3 text-white/40 hover:text-red-300 transition-colors z-10"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>

        {/* avatar initial */}
        <div className="absolute top-3 left-5 w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-sm">
          {fm.name.charAt(0).toUpperCase()}
        </div>

        {/* badges */}
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
        <div className="pb-3 border-b border-gray-100">
          <StatusDot isUsed={fm.is_used} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetaChip icon={<Mail size={12} />}  label="Email" value={fm.email} />
          <MetaChip icon={<Phone size={12} />} label="Phone" value={fm.phone} />
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   Create form — fields left, live card preview right
═══════════════════════════════════════════════════════════ */
const CreateForm = ({ form, inviteLoading, onSubmit, onClose, dispatch }) => {
  const shift     = form.shift || 'Day';
  const shiftMeta = SHIFT_COLOR[shift] ?? SHIFT_COLOR.Day;
  const deptCls   = DEPT_COLOR[form.department] ?? 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg">

      {/* form header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-bold text-gray-800">New Factory Manager</p>
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

        {/* ── LEFT: input fields ── */}
        <div className="p-6 border-r border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Fill in details</p>
          <form onSubmit={onSubmit} className="space-y-3" id="create-manager-form">

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                required type="text" placeholder="e.g. Sarah Chen"
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
                required type="email" placeholder="sarah@factory.com"
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                value={form.email}
                onChange={e => dispatch(updateForm({ email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Phone Number</label>
              <input
                type="text" placeholder="+1 555 000 0000"
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
                  <option>Day</option>
                  <option>Night</option>
                  <option>Swing</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Department</label>
                <select
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition cursor-pointer"
                  value={form.department}
                  onChange={e => dispatch(updateForm({ department: e.target.value }))}
                >
                  <option>Assembly</option>
                  <option>Quality Control</option>
                  <option>Logistics</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              form="create-manager-form"
              disabled={inviteLoading || !form.name?.trim() || !form.email?.trim()}
              className="w-full h-10 mt-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all active:scale-95"
            >
              {inviteLoading
                ? <><Loader2 size={13} className="animate-spin" /> Creating…</>
                : <><ArrowRight size={13} /> Create Card & Send Invite</>}
            </button>
          </form>
        </div>

        {/* ── RIGHT: live card preview ── */}
        <div className="p-6 bg-gray-50/60 flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live preview</p>

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {/* banner */}
            <div
              className="relative h-28 flex flex-col justify-end px-4 pb-3"
              style={{ background: shiftMeta.banner }}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute top-2 right-10 w-8 h-8 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

              {/* avatar */}
              <div className="absolute top-3 left-4 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white font-black text-sm">
                {form.name?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/90 ${shiftMeta.badge}`}>
                  {shift} Shift
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest border rounded-full px-2 py-0.5 bg-white/90 ${deptCls}`}>
                  {form.department || 'Assembly'}
                </span>
              </div>
              <h2 className="text-white font-bold text-base leading-tight drop-shadow">
                {form.name?.trim()
                  ? form.name
                  : <span className="opacity-40 font-normal italic">Manager name</span>}
              </h2>
            </div>

            {/* body */}
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
const FactoryPage = () => {
  const dispatch = useDispatch();
  const {
    managers, total, currentPage,
    form, isFormOpen,
    selectedManager, analytics,
    view, loading, inviteLoading, analyticsLoading,
    toast,
  } = useSelector(state => state.factoryManager);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  useEffect(() => {
    dispatch(fetchFactoryManagers({ page: currentPage, size: ITEMS_PER_PAGE }));
  }, [currentPage, dispatch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch(clearToast()), 3500);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  const handleCardClick = (manager) => {
    dispatch(setSelectedManager(manager));
    dispatch(fetchManagerAnalytics(manager.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createFactoryManager(form));
  };

  const handleRemove = (e, managerId) => {
    e.stopPropagation();
    if (!window.confirm('Remove this manager?')) return;
    dispatch(removeFactoryManager(managerId));
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Factory Control: Team & Performance
          </h1>
          <p className="text-slate-400 text-sm">
            {total} Factory Manager{total !== 1 ? 's' : ''}
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

      {/* ROSTER VIEW */}
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
              {isFormOpen ? 'Close' : 'Add Factory Manager'}
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
                <Users size={28} className="text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">No factory managers yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Add Factory Manager" to create the first card</p>
              </div>
              <button
                onClick={() => dispatch(toggleForm())}
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

      {/* ANALYTICS VIEW */}
      {view === 'analytics' && selectedManager && (
        <div className="space-y-6">

          <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <button
              onClick={() => dispatch(setView('roster'))}
              className="text-slate-400 hover:text-slate-800 transition-colors text-sm font-semibold flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
              style={{ background: SHIFT_COLOR[selectedManager.shift]?.banner ?? '#185FA5' }}
            >
              {selectedManager.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Performance Report: {selectedManager.name}</h2>
              <p className="text-xs text-slate-400">{selectedManager.department} · {selectedManager.shift} Shift</p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 h-44 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Efficiency',     value: `${analytics?.efficiency_score ?? '—'}%`, icon: <Zap size={18} />,         color: 'text-yellow-500' },
                  { label: 'Batches Done',   value: analytics?.batches_completed ?? '—',      icon: <Package size={18} />,      color: 'text-blue-500'   },
                  { label: 'Avg Cycle Time', value: analytics?.avg_cycle_time ?? '—',         icon: <Timer size={18} />,        color: 'text-purple-500' },
                  { label: 'On-Time Rate',   value: analytics?.on_time_rate ?? '—',           icon: <CheckCircle2 size={18} />, color: 'text-emerald-500'},
                ].map((kpi, i) => (
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
                      style={{ width: `${analytics?.efficiency_score ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-4 uppercase font-bold tracking-widest">
                    Reliability: {analytics?.reliability ?? '—'}
                  </p>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Production Feed</h3>
                  <p className="text-slate-400 text-sm italic">
                    Live production data for {selectedManager.name} will be connected
                    once the Factory Manager module migration is complete.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                      <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <ShieldAlert size={11} /> Safety Incidents
                      </p>
                      <p className="text-2xl font-black text-slate-800 mt-1">{analytics?.safety_incidents ?? '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Status</p>
                      <StatusDot isUsed={selectedManager.is_used} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
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

export default FactoryPage;
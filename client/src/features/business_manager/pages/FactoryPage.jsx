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

const ITEMS_PER_PAGE = 9;

// ==========================================
// SUB-COMPONENTS
// ==========================================

const ShiftBadge = ({ shift }) => {
  const styles = {
    Day:   'bg-orange-100 text-orange-600',
    Night: 'bg-indigo-100 text-indigo-600',
    Swing: 'bg-purple-100 text-purple-600',
  };
  return (
    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${styles[shift] || 'bg-slate-100 text-slate-600'}`}>
      {shift} Shift
    </span>
  );
};

const StatusDot = ({ isUsed }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${isUsed ? 'text-emerald-600' : 'text-amber-500'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${isUsed ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
    {isUsed ? 'Active' : 'Invite Sent'}
  </span>
);

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 animate-pulse space-y-4">
    <div className="flex justify-between">
      <div className="h-12 w-12 bg-slate-100 rounded-2xl" />
      <div className="h-5 w-20 bg-slate-100 rounded-lg" />
    </div>
    <div className="h-4 bg-slate-100 rounded w-3/4" />
    <div className="h-3 bg-slate-100 rounded w-1/2" />
    <div className="h-px bg-slate-100" />
    <div className="space-y-2">
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  </div>
);

// ==========================================
// MAIN PAGE
// ==========================================

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

  // ---- fetch on mount + page change ----
  useEffect(() => {
    dispatch(fetchFactoryManagers({ page: currentPage, size: ITEMS_PER_PAGE }));
  }, [currentPage, dispatch]);

  // ---- auto-clear toast ----
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dispatch(clearToast()), 3500);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  // ---- handlers ----
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

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Factory Control: Team & Performance
          </h1>
          <p className="text-slate-400 text-sm">
            {total} Factory Manager{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* view toggle */}
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

      {/* ══════════════════════════════
           ROSTER VIEW
         ══════════════════════════════ */}
      {view === 'roster' && (
        <div className="space-y-6">

          {/* action bar */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">
              Manager Directory
            </h2>
            <button
              onClick={() => dispatch(toggleForm())}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all"
            >
              {isFormOpen ? '✕ CLOSE' : '＋ ADD FACTORY MANAGER'}
            </button>
          </div>

          {/* ── CREATE FORM ── */}
          {isFormOpen && (
            <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-8">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-6">
                New Factory Manager — card is created instantly & invite email is sent
              </p>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* col 1 */}
                <div className="space-y-4">
                  <input
                    required type="text" placeholder="Full Name"
                    className="w-full p-3 rounded-xl border border-blue-200 outline-none text-sm bg-white"
                    value={form.name}
                    onChange={e => dispatch(updateForm({ name: e.target.value }))}
                  />
                  <input
                    required type="email" placeholder="Work Email"
                    className="w-full p-3 rounded-xl border border-blue-200 outline-none text-sm bg-white"
                    value={form.email}
                    onChange={e => dispatch(updateForm({ email: e.target.value }))}
                  />
                </div>

                {/* col 2 */}
                <div className="space-y-4">
                  <input
                    type="text" placeholder="Phone Number"
                    className="w-full p-3 rounded-xl border border-blue-200 outline-none text-sm bg-white"
                    value={form.phone}
                    onChange={e => dispatch(updateForm({ phone: e.target.value }))}
                  />
                  <select
                    className="w-full p-3 rounded-xl border border-blue-200 outline-none text-sm bg-white"
                    value={form.shift}
                    onChange={e => dispatch(updateForm({ shift: e.target.value }))}
                  >
                    <option>Day</option>
                    <option>Night</option>
                    <option>Swing</option>
                  </select>
                </div>

                {/* col 3 */}
                <div className="flex flex-col justify-between gap-4">
                  <select
                    className="w-full p-3 rounded-xl border border-blue-200 outline-none text-sm bg-white"
                    value={form.department}
                    onChange={e => dispatch(updateForm({ department: e.target.value }))}
                  >
                    <option>Assembly</option>
                    <option>Quality Control</option>
                    <option>Logistics</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all"
                  >
                    {inviteLoading ? 'CREATING...' : 'CREATE CARD & SEND INVITE'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── 3×3 GRID ── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <span className="text-4xl">👤</span>
              <p className="font-semibold text-sm">No factory managers yet.</p>
              <p className="text-xs">Click "Add Factory Manager" to create the first card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managers.map(fm => (
                <div
                  key={fm.id}
                  onClick={() => handleCardClick(fm)}
                  className={`group bg-white p-6 rounded-3xl border-2 transition-all cursor-pointer hover:shadow-xl hover:border-blue-400 ${
                    selectedManager?.id === fm.id ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'
                  }`}
                >
                  {/* card top */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-lg font-black text-slate-600 group-hover:bg-blue-100 transition-colors">
                      {fm.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      <ShiftBadge shift={fm.shift} />
                      <button
                        onClick={(e) => handleRemove(e, fm.id)}
                        className="text-slate-200 hover:text-red-400 font-bold text-sm transition-colors"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{fm.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5 mb-3">{fm.department} Department</p>
                  <StatusDot isUsed={fm.is_used} />

                  {/* contact */}
                  <div className="space-y-1 border-t border-slate-50 pt-4 mt-4">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Contact</p>
                    <p className="text-xs text-slate-600 truncate">{fm.email}</p>
                    <p className="text-xs text-slate-600">{fm.phone || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:border-blue-300 transition-colors"
              >
                ←
              </button>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:border-blue-300 transition-colors"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════
           ANALYTICS VIEW
         ══════════════════════════════ */}
      {view === 'analytics' && selectedManager && (
        <div className="space-y-6">

          {/* back bar */}
          <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <button
              onClick={() => dispatch(setView('roster'))}
              className="text-slate-400 hover:text-slate-800 transition-colors text-sm font-semibold"
            >
              ← Back
            </button>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-black text-blue-600">
              {selectedManager.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-800">
                Performance Report: {selectedManager.name}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedManager.department} · {selectedManager.shift} Shift
              </p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-100 h-44 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Efficiency',       value: `${analytics?.efficiency_score ?? '—'}%`, icon: '⚡' },
                  { label: 'Batches Done',     value: analytics?.batches_completed ?? '—',      icon: '📦' },
                  { label: 'Avg Cycle Time',   value: analytics?.avg_cycle_time ?? '—',         icon: '⏱️' },
                  { label: 'On-Time Rate',     value: analytics?.on_time_rate ?? '—',           icon: '✅' },
                ].map((kpi, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <span className="text-xl">{kpi.icon}</span>
                    <p className="text-2xl font-black text-slate-800 mt-2">{kpi.value}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* main cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* efficiency gauge */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Manager Efficiency
                  </p>
                  <h3 className="text-5xl font-black">
                    {analytics?.efficiency_score ?? '—'}%
                  </h3>
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

                {/* production feed placeholder */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Production Feed</h3>
                  <p className="text-slate-400 text-sm italic">
                    Live production data for {selectedManager.name} will be connected
                    once the Factory Manager module migration is complete.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Safety Incidents</p>
                      <p className="text-2xl font-black text-slate-800 mt-1">
                        {analytics?.safety_incidents ?? '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                      <StatusDot isUsed={selectedManager.is_used} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TOAST ── */}
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
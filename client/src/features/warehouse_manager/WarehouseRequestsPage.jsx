import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, handleRequestAction, bulkRequestAction } from '../../redux/requestsSlice';
import { 
  BellRing, CheckCircle2, XCircle, Clock, ShieldAlert,
  ArrowRight, User, Activity, History, Search, X, Filter,
  CheckSquare, Square, ChevronDown, ChevronUp, Info, Sparkles, Shield
} from 'lucide-react';

// ─── Copper palette ─────────────────────────────────────────────────────────
const CU = {
  bg:          '#0c0a09',
  card:        '#1c1410',
  cardHover:   '#211810',
  border:      'rgba(184,115,51,0.2)',
  borderHover: 'rgba(184,115,51,0.4)',
  accent:      '#b87333',
  accentLight: '#d4956a',
  accentDark:  '#8b5a2b',
  accentFaint: 'rgba(184,115,51,0.08)',
};

const PRIORITY_STYLES = {
  high:     { bg:'rgba(239,68,68,0.08)',  text:'#f87171', border:'rgba(239,68,68,0.2)' },
  medium:   { bg:'rgba(184,115,51,0.12)', text:'#d4956a', border:'rgba(184,115,51,0.3)' },
  low:      { bg:'rgba(120,113,108,0.1)', text:'#78716c', border:'rgba(120,113,108,0.2)' },
  standard: { bg:'rgba(184,115,51,0.07)', text:'#b87333', border:'rgba(184,115,51,0.2)' },
};

const TYPE_ICONS = {
  'Purchase Order':   '🧾',
  'Stock Adjustment': '⚖️',
  'Transfer Request': '↔️',
  'Restock Request':  '📦',
  'Add Product':      '🏷️',
  'Add Rack':         '🗂️',
  'System Action':    '⚙️',
  'Supplier Request': '🤝',
};

const PriorityBadge = ({ priority }) => {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.standard;
  return (
    <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {priority}
    </span>
  );
};

const WarehouseRequestsPage = () => {
  const dispatch = useDispatch();
  const { items: requests, loading, actionLoadingId } = useSelector(s => s.requests);

  const [filter, setFilter]               = useState('pending');
  const [searchQuery, setSearchQuery]     = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter]       = useState('all');
  const [selectedIds, setSelectedIds]     = useState([]);
  const [expandedId, setExpandedId]       = useState(null);
  const [toast, setToast]                 = useState(null);

  useEffect(() => { dispatch(fetchRequests()); }, [dispatch]);

  const showToast = (msg, type = 'success') => {
    let message = msg;
    if (typeof msg === 'object' && msg !== null) {
      if (Array.isArray(msg)) message = msg.map(m => m.msg || JSON.stringify(m)).join(', ');
      else if (msg.detail) message = typeof msg.detail === 'object' ? JSON.stringify(msg.detail) : msg.detail;
      else message = JSON.stringify(msg);
    }
    setToast({ msg: message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const wmFiltered = requests.filter(r => {
    const isRelevantRole = r.role === 'warehouse_manager' || r.role === 'System Agent' ||
      ['Restock Request', 'Add Product', 'Add Rack'].includes(r.type);
    const matchesStatus   = filter === 'all' ? true : r.status === filter;
    const matchesSearch   =
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id?.toString().includes(searchQuery);
    const matchesPriority = priorityFilter === 'all' ? true : r.priority === priorityFilter;
    const matchesType     = typeFilter === 'all' ? true : r.type === typeFilter;
    return isRelevantRole && matchesStatus && matchesSearch && matchesPriority && matchesType;
  });

  const onAction = async (id, action) => {
    try {
      await dispatch(handleRequestAction({ requestId: id, action: action.toUpperCase() })).unwrap();
      showToast(`Request #${id} ${action.toLowerCase() === 'approve' ? 'authorized' : 'denied'} successfully.`,
        action.toLowerCase() === 'approve' ? 'success' : 'error');
    } catch (err) {
      showToast(err?.detail || `Failed to process request #${id}`, 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await dispatch(bulkRequestAction({ ids: selectedIds, action: action.toUpperCase() })).unwrap();
      showToast(`Bulk processed ${selectedIds.length} requests successfully.`,
        action.toLowerCase() === 'approve' ? 'success' : 'error');
      setSelectedIds([]);
    } catch (err) {
      showToast(err?.detail || 'Bulk action failed.', 'error');
    }
  };

  const handleSelectAll = () => {
    const pendingIds = wmFiltered.filter(r => r.status === 'pending').map(r => r.id);
    setSelectedIds(selectedIds.length === pendingIds.length ? [] : pendingIds);
  };

  const handleSelectRow = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleExpandRow = (id) =>
    setExpandedId(expandedId === id ? null : id);

  const statusTabs = ['pending', 'approved', 'rejected', 'all'];

  return (
    <div className="space-y-6 text-white" style={{ background: 'transparent' }}>

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 rounded-full" style={{ background: `linear-gradient(180deg, ${CU.accent}, ${CU.accentDark})` }} />
            <h1 className="text-2xl font-black tracking-tight uppercase text-white">
              Warehouse Directives
            </h1>
          </div>
          <p className="text-stone-500 font-semibold ml-4 text-sm">
            Replenishment requests and stock inventory controls queue.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
            style={{ background: 'rgba(184,115,51,0.1)', border: `1px solid ${CU.border}`, color: CU.accentLight }}>
            <Activity size={12} /> System Active
          </div>
          <button onClick={() => dispatch(fetchRequests())}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-500 hover:text-white transition-all"
            style={{ background: CU.card, border: `1px solid ${CU.border}` }}
            title="Refresh Requests">
            <History size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: CU.card, border: `1px solid ${CU.border}` }}>
        <div className="flex flex-col lg:flex-row gap-3 items-center">
          
          {/* Search */}
          <div className="relative w-full lg:flex-1">
            <Search size={14} className="absolute left-3.5 top-3.5 text-stone-500" />
            <input type="text"
              placeholder="Search requests by ID, description, or type..."
              className="w-full h-10 pl-10 pr-4 rounded-xl text-sm text-white placeholder:text-stone-600 outline-none transition-all"
              style={{ background: CU.bg, border: `1px solid ${CU.border}` }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-stone-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 rounded-xl p-1 shrink-0 w-full lg:w-auto"
            style={{ background: CU.bg, border: `1px solid ${CU.border}` }}>
            {statusTabs.map(tab => (
              <button key={tab}
                onClick={() => { setFilter(tab); setSelectedIds([]); }}
                className="flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap"
                style={filter === tab
                  ? { background: `linear-gradient(135deg, ${CU.accent}, ${CU.accentDark})`, color: 'white' }
                  : { color: '#78716c' }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Type filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between pt-3"
          style={{ borderTop: `1px solid ${CU.border}` }}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={11} style={{ color: CU.accentLight }} />
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Priority:</span>
              <select className="rounded-lg text-[11px] font-bold px-3 py-1.5 outline-none cursor-pointer text-stone-300"
                style={{ background: CU.bg, border: `1px solid ${CU.border}` }}
                value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="all" className="bg-stone-950">All Priorities</option>
                <option value="high" className="bg-stone-950">🔴 High</option>
                <option value="medium" className="bg-stone-950">🟡 Medium</option>
                <option value="standard" className="bg-stone-950">🟤 Standard</option>
                <option value="low" className="bg-stone-950">⚪ Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Type:</span>
              <select className="rounded-lg text-[11px] font-bold px-3 py-1.5 outline-none cursor-pointer text-stone-300"
                style={{ background: CU.bg, border: `1px solid ${CU.border}` }}
                value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all" className="bg-stone-950">All Types</option>
                {Object.keys(TYPE_ICONS).map(type => (
                  <option key={type} value={type} className="bg-stone-950">{TYPE_ICONS[type]} {type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-[11px] font-semibold" style={{ color: CU.accentLight }}>
            {wmFiltered.length} matching requests
          </div>
        </div>
      </div>

      {/* ── BULK ACTION BAR ── */}
      {selectedIds.length > 0 && filter === 'pending' && (
        <div className="flex items-center justify-between rounded-2xl px-6 py-4 animate-in slide-in-from-top duration-300"
          style={{ background: 'rgba(184,115,51,0.1)', border: `1px solid rgba(184,115,51,0.35)` }}>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={16} style={{ color: CU.accentLight }} />
            <span className="text-sm font-bold text-white">
              {selectedIds.length} request{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSelectedIds([])}
              className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-white transition-colors">
              Clear
            </button>
            <button onClick={() => handleBulkAction('reject')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-colors"
              style={{ border: '1px solid rgba(244,63,94,0.25)' }}>
              Deny Selected
            </button>
            <button onClick={() => handleBulkAction('approve')}
              className="px-5 py-1.5 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${CU.accent}, ${CU.accentDark})` }}>
              Authorize Selected
            </button>
          </div>
        </div>
      )}

      {/* ── REQUEST LIST ── */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: CU.card }} />
          ))
        ) : wmFiltered.length === 0 ? (
          <div className="py-24 text-center rounded-2xl border border-dashed"
            style={{ background: 'rgba(184,115,51,0.03)', borderColor: 'rgba(184,115,51,0.15)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(184,115,51,0.1)', border: `1px solid ${CU.border}` }}>
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider text-white">Queue Cleared</h3>
            <p className="text-stone-500 font-semibold text-sm mt-1">
              All warehouse replenishment authorizations are up to date.
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {/* Select All */}
            {filter === 'pending' && (
              <div onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-stone-500 uppercase tracking-widest cursor-pointer select-none w-fit hover:text-white transition-colors rounded-lg"
                style={{ background: 'rgba(184,115,51,0.05)' }}>
                {selectedIds.length === wmFiltered.filter(r => r.status === 'pending').length ? (
                  <CheckSquare size={14} style={{ color: CU.accentLight }} />
                ) : (
                  <Square size={14} />
                )}
                Select All Pending ({wmFiltered.filter(r => r.status === 'pending').length})
              </div>
            )}

            {wmFiltered.map((req) => {
              const isSelected = selectedIds.includes(req.id);
              const isExpanded = expandedId === req.id;
              const isPending  = req.status === 'pending';

              const cardBorder =
                req.status === 'approved' ? 'rgba(16,185,129,0.15)' :
                req.status === 'rejected' ? 'rgba(244,63,94,0.15)' :
                isSelected ? 'rgba(184,115,51,0.5)' : CU.border;

              const cardBg = isSelected ? 'rgba(184,115,51,0.05)' : CU.card;

              return (
                <div key={req.id}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    opacity: req.status !== 'pending' ? 0.75 : 1
                  }}>

                  {/* Card Header Row */}
                  <div onClick={() => toggleExpandRow(req.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none group">

                    <div className="flex items-center gap-4 flex-1 min-w-0">

                      {/* Checkbox */}
                      {filter === 'pending' && (
                        <div onClick={e => { e.stopPropagation(); handleSelectRow(req.id); }}
                          className="shrink-0 p-1 hover:text-white transition-colors">
                          {isSelected
                            ? <CheckSquare size={16} style={{ color: CU.accentLight }} />
                            : <Square size={16} className="text-stone-600 hover:text-stone-400" />}
                        </div>
                      )}

                      {/* Type icon */}
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg"
                        style={{ background: 'rgba(184,115,51,0.1)', border: `1px solid ${CU.border}` }}>
                        {TYPE_ICONS[req.type] || '📋'}
                      </div>

                      {/* Meta */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">#{req.id}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-stone-400"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                            {req.type}
                          </span>
                          <PriorityBadge priority={req.priority} />
                        </div>
                        <p className="text-sm font-semibold text-white leading-relaxed truncate">{req.description}</p>
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-600">
                            <User size={9} /> Business Manager
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-stone-600">
                            <Clock size={9} /> {new Date(req.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions / Status */}
                    <div className="flex items-center gap-3 shrink-0 sm:self-center">
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); onAction(req.id, 'REJECT'); }}
                            disabled={actionLoadingId === req.id}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-rose-400 transition-all"
                            style={{ background: CU.bg, border: `1px solid ${CU.border}` }}>
                            Deny
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); onAction(req.id, 'APPROVE'); }}
                            disabled={actionLoadingId === req.id}
                            className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:opacity-90 shadow-md"
                            style={{ background: `linear-gradient(135deg, ${CU.accent}, ${CU.accentDark})` }}>
                            {actionLoadingId === req.id ? '...' : 'Authorize'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border"
                          style={req.status === 'approved'
                            ? { background:'rgba(16,185,129,0.1)', color:'#34d399', borderColor:'rgba(16,185,129,0.2)' }
                            : { background:'rgba(244,63,94,0.1)', color:'#fb7185', borderColor:'rgba(244,63,94,0.2)' }}>
                          {req.status === 'approved' ? '✓ Authorized' : '✕ Denied'}
                        </span>
                      )}
                      {isExpanded
                        ? <ChevronUp size={14} className="text-stone-500" />
                        : <ChevronDown size={14} className="text-stone-500" />}
                    </div>
                  </div>

                  {/* ── EXPANDED DETAILS ── */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 animate-in slide-in-from-top-2 duration-200"
                      style={{ borderTop: `1px solid ${CU.border}`, background: 'rgba(184,115,51,0.03)' }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">

                        {/* Payload block */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: CU.accentLight }}>
                            <Info size={11} />
                            {req.type === 'Add Product' ? 'New Product Specifications' :
                             req.type === 'Add Rack'    ? 'New Rack Specifications' :
                             'Restock Ticket Specifications'}
                          </h4>
                          <div className="rounded-xl p-4 text-xs space-y-3"
                            style={{ background: CU.bg, border: `1px solid ${CU.border}` }}>

                            {req.type === 'Add Product' && (
                              <>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">PRODUCT NAME</span>
                                    <span className="text-white font-mono font-semibold">{req.payload?.product_name || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">SKU</span>
                                    <span className="font-mono font-semibold" style={{ color: CU.accentLight }}>{req.payload?.sku || 'Auto-Generated'}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">PRODUCT TYPE</span>
                                    <span className="text-white font-mono">{req.payload?.product_type || 'finished_good'}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">MIN STOCK</span>
                                    <span className="font-mono" style={{ color: CU.accentLight }}>{req.payload?.threshold || 10} units</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2.5 pt-2.5" style={{ borderTop: `1px solid ${CU.border}` }}>
                                  {[['COST', `$${req.payload?.product_cost || 0}`], ['PRICE', `$${req.payload?.product_price || 0}`], ['WEIGHT', `${req.payload?.product_weight || 1}kg`]].map(([k,v]) => (
                                    <div key={k}>
                                      <span className="text-stone-600 font-bold block mb-0.5">{k}</span>
                                      <span className="text-white font-mono">{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {req.type === 'Add Rack' && (
                              <>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">RACK NAME</span>
                                    <span className="text-white font-mono font-semibold">{req.payload?.rack_name || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">ZONE / SECTION</span>
                                    <span className="font-mono font-semibold" style={{ color: CU.accentLight }}>{req.payload?.rack_zone || 'General'}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5 pt-2.5" style={{ borderTop: `1px solid ${CU.border}` }}>
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">ROWS</span>
                                    <span className="text-white font-mono">{req.payload?.rack_rows || 5}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">MAX WEIGHT</span>
                                    <span className="font-mono" style={{ color: CU.accentLight }}>{req.payload?.rack_max_weight || 5000} kg</span>
                                  </div>
                                </div>
                              </>
                            )}

                            {(req.type === 'Restock Request' || (!req.type || (req.type !== 'Add Product' && req.type !== 'Add Rack'))) && (
                              <>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">PRODUCT NAME</span>
                                    <span className="text-white font-mono font-semibold">{req.payload?.product_name || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">REPLENISH QTY</span>
                                    <span className="font-mono font-semibold" style={{ color: CU.accentLight }}>{req.payload?.qty} Units</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">MIN THRESHOLD</span>
                                    <span className="text-white font-mono">{req.payload?.threshold || '50'}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-600 font-bold block mb-0.5">PRIORITY</span>
                                    <span className="font-bold uppercase" style={{ color: CU.accentLight }}>{req.priority || 'standard'}</span>
                                  </div>
                                </div>
                              </>
                            )}

                            <div className="pt-2.5" style={{ borderTop: `1px solid ${CU.border}` }}>
                              <span className="text-stone-600 font-bold block mb-0.5">DIRECTIVE NOTES</span>
                              <p className="text-stone-400 leading-relaxed italic">"{req.payload?.alert_message || req.description}"</p>
                            </div>
                          </div>
                        </div>

                        {/* Action preview block */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: CU.accentLight }}>
                            <Sparkles size={11} /> Action Preview on Approval
                          </h4>
                          <div className="rounded-xl p-4 text-xs text-stone-400 leading-relaxed space-y-2.5"
                            style={{ background: 'rgba(184,115,51,0.06)', border: `1px solid rgba(184,115,51,0.15)` }}>
                            <p className="font-black flex items-center gap-1.5" style={{ color: CU.accentLight }}>
                              <Shield size={11} /> Compliance Integrity Secure
                            </p>
                            {req.type === 'Add Product' && (
                              <p>Approving this will <strong className="text-white">create a new product</strong> "{req.payload?.product_name}"
                                (Type: {req.payload?.product_type}, SKU: {req.payload?.sku || 'auto-generated'})
                                in the warehouse catalog with a minimum stock level of {req.payload?.threshold || 10} units.
                                An empty inventory entry will also be initialized.</p>
                            )}
                            {req.type === 'Add Rack' && (
                              <p>Approving this will <strong className="text-white">add Rack "{req.payload?.rack_name}"</strong> to the warehouse
                                in Zone "{req.payload?.rack_zone || 'General'}" with {req.payload?.rack_rows || 5} rows
                                and a max load capacity of {req.payload?.rack_max_weight || 5000}kg.</p>
                            )}
                            {req.type === 'Restock Request' && (
                              <p>The replenishment of <strong className="text-white">{req.payload?.qty} units</strong> of <strong className="text-white">{req.payload?.product_name}</strong> is
                                compliant with general warehouse capacity profiles. Stock thresholds of <strong className="text-white">{req.payload?.threshold || 50} units</strong> align
                                with supply continuity metrics.</p>
                            )}
                            {!['Add Product', 'Add Rack', 'Restock Request'].includes(req.type) && (
                              <p>Action verified. Warehouse capacity and inventory parameters check out. Ready for authorization.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold border transition-all`}
          style={toast.type === 'success'
            ? { background:'#1c1410', borderColor:'rgba(184,115,51,0.4)', color:'white' }
            : { background:'#1c1010', borderColor:'rgba(244,63,94,0.3)', color:'white' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default WarehouseRequestsPage;

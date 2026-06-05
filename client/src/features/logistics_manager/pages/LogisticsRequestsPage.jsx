import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, handleRequestAction, bulkRequestAction } from '../../../redux/requestsSlice';
import { 
  BellRing, CheckCircle2, XCircle, Clock, ShieldAlert,
  ArrowRight, User, Activity, History, Search, X, Filter,
  CheckSquare, Square, ChevronDown, ChevronUp, Info, Sparkles, Shield
} from 'lucide-react';

const PRIORITY_STYLES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20',
  low: 'bg-white/5 text-gray-400 border-white/10',
  standard: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

const TYPE_ICONS = {
  'Purchase Order': '🧾',
  'Stock Adjustment': '⚖️',
  'Transfer Request': '↔️',
  'Restock Request': '📦',
  'Add Vehicle': '🚛',
  'System Action': '⚙️',
  'Supplier Request': '🤝'
};

const LogisticsRequestsPage = () => {
  const dispatch = useDispatch();
  const { items: requests, loading, actionLoadingId } = useSelector(s => s.requests);

  // States
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const showToast = (msg, type = 'success') => {
    let message = msg;
    if (typeof msg === 'object' && msg !== null) {
      if (Array.isArray(msg)) {
        message = msg.map(m => m.msg || JSON.stringify(m)).join(', ');
      } else if (msg.detail) {
        message = typeof msg.detail === 'object' ? JSON.stringify(msg.detail) : msg.detail;
      } else {
        message = JSON.stringify(msg);
      }
    }
    setToast({ msg: message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filter for requests relevant to Logistics Manager
  const lmFiltered = requests.filter(r => {
    const isRelevantRole = r.role === 'logistics_manager' ||
      ['Transfer Request', 'Add Vehicle'].includes(r.type);
    const matchesStatus = filter === 'all' ? true : r.status === filter;
    
    const matchesSearch = 
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id?.toString().includes(searchQuery);

    const matchesPriority = priorityFilter === 'all' ? true : r.priority === priorityFilter;
    const matchesType = typeFilter === 'all' ? true : r.type === typeFilter;

    return isRelevantRole && matchesStatus && matchesSearch && matchesPriority && matchesType;
  });

  const onAction = async (id, action) => {
    try {
      await dispatch(handleRequestAction({ requestId: id, action: action.toUpperCase() })).unwrap();
      showToast(`Request #${id} ${action.toLowerCase() === 'approve' ? 'authorized' : 'denied'} successfully.`, action.toLowerCase() === 'approve' ? 'success' : 'error');
    } catch (err) {
      showToast(err?.detail || `Failed to process request #${id}`, 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await dispatch(bulkRequestAction({ ids: selectedIds, action: action.toUpperCase() })).unwrap();
      showToast(`Bulk processed ${selectedIds.length} requests successfully.`, action.toLowerCase() === 'approve' ? 'success' : 'error');
      setSelectedIds([]);
    } catch (err) {
      showToast(err?.detail || 'Bulk action failed.', 'error');
    }
  };

  const handleSelectAll = () => {
    const pendingFilteredIds = lmFiltered
      .filter(r => r.status === 'pending')
      .map(r => r.id);
    
    if (selectedIds.length === pendingFilteredIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingFilteredIds);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const toggleExpandRow = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
            <h1 className="text-3xl font-black tracking-tighter uppercase">Cargo Dispatch Center</h1>
          </div>
          <p className="text-white/40 font-bold ml-4">Transfer requests and cargo shipments dispatch queue.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} /> Fleet Operational
          </div>
          <button 
            onClick={() => dispatch(fetchRequests())}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
            title="Refresh Requests"
          >
            <History size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats and Filter Area */}
      <div className="bg-[#0c0c0c] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search bar */}
          <div className="relative w-full lg:flex-1">
            <Search size={15} className="absolute left-4 top-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search requests by ID, description, or type..."
              className="w-full h-11 pl-11 pr-4 bg-black border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-white/30 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-black border border-white/[0.08] rounded-xl p-1 shrink-0 w-full lg:w-auto overflow-x-auto">
            {['pending', 'approved', 'rejected', 'all'].map(tab => (
              <button
                key={tab}
                onClick={() => { setFilter(tab); setSelectedIds([]); }}
                className={`flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-550/15' : 'text-white/45 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Type Filtering Dropdowns */}
        <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Priority Select */}
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-white/30" />
              <span className="text-xs text-white/30 font-bold uppercase tracking-wider">Priority:</span>
              <select
                className="bg-black border border-white/[0.08] rounded-lg text-xs font-bold text-white/60 px-3 py-1.5 outline-none cursor-pointer focus:border-emerald-500/50"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="standard">🔵 Standard</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>

            {/* Type Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30 font-bold uppercase tracking-wider">Type:</span>
              <select
                className="bg-black border border-white/[0.08] rounded-lg text-xs font-bold text-white/60 px-3 py-1.5 outline-none cursor-pointer focus:border-emerald-500/50"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {Object.keys(TYPE_ICONS).map(type => (
                  <option key={type} value={type}>{TYPE_ICONS[type]} {type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-white/30 font-semibold">
            Showing {lmFiltered.length} matching requests
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && filter === 'pending' && (
        <div className="flex items-center justify-between bg-emerald-950/80 border border-emerald-500/30 rounded-2xl px-6 py-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-450" />
            <span className="text-sm font-bold text-white">
              {selectedIds.length} request{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white"
            >
              Clear selection
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              Deny Selected
            </button>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/15"
            >
              Authorize Selected
            </button>
          </div>
        </div>
      )}

      {/* Requests Lists */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)
        ) : lmFiltered.length === 0 ? (
          <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider text-white">Queue Cleared</h3>
            <p className="text-white/40 font-bold text-sm mt-1">All cargo dispatch and fleet transfer routes are up to date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All Checkbox for Pending queue */}
            {filter === 'pending' && (
              <div 
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white/40 uppercase tracking-widest cursor-pointer select-none w-fit hover:text-white transition-colors"
              >
                {selectedIds.length === lmFiltered.filter(r => r.status === 'pending').length ? (
                  <CheckSquare size={14} className="text-emerald-450" />
                ) : (
                  <Square size={14} />
                )}
                Select All Pending ({lmFiltered.filter(r => r.status === 'pending').length})
              </div>
            )}

            {lmFiltered.map((req) => {
              const isSelected = selectedIds.includes(req.id);
              const isExpanded = expandedId === req.id;

              return (
                <div 
                  key={req.id} 
                  className={`bg-[#0b0b0b] border rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-200 ${
                    req.status === 'approved' ? 'border-emerald-500/10 opacity-70' :
                    req.status === 'rejected' ? 'border-rose-500/10 opacity-60' :
                    isSelected ? 'border-emerald-500/50 bg-emerald-500/[0.02]' : 'border-white/[0.06]'
                  }`}
                >
                  <div 
                    onClick={() => toggleExpandRow(req.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Checkbox for pending */}
                      {filter === 'pending' && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); handleSelectRow(req.id); }}
                          className="shrink-0 p-1 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-emerald-400" />
                          ) : (
                            <Square size={16} className="text-white/10 hover:text-white/30" />
                          )}
                        </div>
                      )}

                      <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-emerald-450 shrink-0">
                        <span className="text-lg">{TYPE_ICONS[req.type] || '📋'}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-white/30 uppercase tracking-wide">#{req.id}</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/50 border border-white/5">
                            {req.type}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${PRIORITY_STYLES[req.priority] || PRIORITY_STYLES.standard}`}>
                            {req.priority}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white leading-relaxed truncate">{req.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                            <User size={10} /> Requester: Business Manager
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
                            <Clock size={10} /> {new Date(req.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:self-center">
                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAction(req.id, 'REJECT'); }}
                            disabled={actionLoadingId === req.id}
                            className="px-4 py-2 rounded-xl bg-black text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/[0.06]"
                          >
                            Deny
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAction(req.id, 'APPROVE'); }}
                            disabled={actionLoadingId === req.id}
                            className="px-5 py-2 rounded-xl bg-emerald-500 text-[10px] font-bold uppercase tracking-widest text-black shadow-md shadow-emerald-500/15 hover:bg-emerald-450 transition-all"
                          >
                            {actionLoadingId === req.id ? '...' : 'Authorize'}
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                          req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {req.status === 'approved' ? '✓ Authorized' : '✕ Denied'}
                        </span>
                      )}

                      {isExpanded ? (
                        <ChevronUp size={15} className="text-white/30" />
                      ) : (
                        <ChevronDown size={15} className="text-white/30" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/[0.06] bg-white/[0.005] animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                            <Info size={12} />
                            {req.type === 'Add Vehicle' ? 'New Vehicle Specifications' : 'Transfer Specifications'}
                          </h4>
                          
                          <div className="bg-black border border-white/[0.06] rounded-xl p-4 text-xs space-y-3">
                            {req.type === 'Add Vehicle' ? (
                              <>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">FLEET ID</span>
                                    <span className="text-white font-mono font-semibold">{req.payload?.fleet_id || 'Auto-Generated'}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">VEHICLE TYPE</span>
                                    <span className="text-emerald-400 font-mono font-semibold">{req.payload?.vehicle_type || 'Truck'}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">DRIVER</span>
                                    <span className="text-white font-mono">{req.payload?.driver_name || 'Unassigned'}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">CAPACITY</span>
                                    <span className="text-emerald-400 font-mono">{req.payload?.vehicle_capacity || 5000}kg</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5 border-t border-white/[0.06] pt-2.5">
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">PRIMARY ROUTE</span>
                                    <span className="text-white font-mono">{req.payload?.route || 'Domestic'}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">HOME WAREHOUSE</span>
                                    <span className="text-white font-mono">{req.payload?.stop_warehouse_name || 'Main Warehouse'}</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">SHIPPING ROUTE</span>
                                    <span className="text-white font-mono font-semibold">{req.payload?.route}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">PRODUCT SKU</span>
                                    <span className="text-white font-mono font-semibold">{req.payload?.sku}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">DISPATCH QUANTITY</span>
                                    <span className="text-emerald-400 font-mono font-semibold">{req.payload?.ship_qty} Units</span>
                                  </div>
                                  <div>
                                    <span className="text-white/30 font-bold block mb-0.5">PRIORITY</span>
                                    <span className="text-emerald-400 font-bold uppercase">{req.priority || 'standard'}</span>
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="border-t border-white/[0.06] pt-2.5">
                              <span className="text-white/30 font-bold block mb-0.5">NOTES</span>
                              <p className="text-white/70 leading-relaxed italic">"{req.payload?.alert_message || req.description}"</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-emerald-400" /> Action Preview on Approval
                          </h4>
                          <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-4 text-xs text-white/50 leading-relaxed space-y-2">
                            <p className="font-bold text-emerald-400 flex items-center gap-1">
                              <Shield size={12} /> Dispatch Compliance Secure
                            </p>
                            {req.type === 'Add Vehicle' ? (
                              <p>
                                Approving this will <strong>add a {req.payload?.vehicle_type || 'Truck'}</strong>{' '}
                                (Fleet ID: {req.payload?.fleet_id || 'auto-generated'}) with a capacity of{' '}
                                <strong>{req.payload?.vehicle_capacity || 5000}kg</strong> to the logistics fleet.{' '}
                                Driver: <strong>{req.payload?.driver_name || 'Unassigned'}</strong>. Primary route: {req.payload?.route || 'Domestic'}.
                              </p>
                            ) : (
                              <p>
                                The shipping route <strong>{req.payload?.route}</strong> is verified.{' '}
                                Dispatching <strong>{req.payload?.ship_qty} units</strong> of SKU{' '}
                                <strong>{req.payload?.sku}</strong> satisfies fleet load capacity compliance.
                                Ready for dispatcher mapping.
                              </p>
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

      {/* Toast notifications */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold border transition-all ${
          toast.type === 'success' ? 'bg-[#0f1715] border-emerald-500/30 text-white' : 'bg-[#1a1111] border-rose-500/30 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default LogisticsRequestsPage;

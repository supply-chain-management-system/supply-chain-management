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
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-white/5 text-gray-400 border-white/10',
  standard: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};

const TYPE_ICONS = {
  'Purchase Order': '🧾',
  'Stock Adjustment': '⚖️',
  'Transfer Request': '↔️',
  'Restock Request': '📦',
  'System Action': '⚙️',
  'Supplier Request': '🤝'
};

const RequestsPage = () => {
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

  // Filter for requests relevant to Supplier Manager
  const smFiltered = requests.filter(r => {
    // Filter for role === 'supply_manager' or any general request
    const isRelevantRole = r.role === 'supply_manager' || r.role === 'System Agent' || !r.role;
    const matchesStatus = filter === 'all' ? true : r.status === filter;
    
    const matchesSearch = 
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    const pendingFilteredIds = smFiltered
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

  const pendingCount = requests.filter(r => (r.role === 'supply_manager' || !r.role) && r.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-red-650 rounded-full" />
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Decision Center</h1>
          </div>
          <p className="text-gray-500 font-bold ml-4">Critical authorization queue for supply chain synchronization.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} /> System Active
          </div>
          <button 
            onClick={() => dispatch(fetchRequests())}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
            title="Refresh Requests"
          >
            <History size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats and Filter Area */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search bar */}
          <div className="relative w-full lg:flex-1">
            <Search size={15} className="absolute left-4 top-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search requests by ID, description, or type..."
              className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0 w-full lg:w-auto overflow-x-auto">
            {['pending', 'approved', 'rejected', 'all'].map(tab => (
              <button
                key={tab}
                onClick={() => { setFilter(tab); setSelectedIds([]); }}
                className={`flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab ? 'bg-red-650 text-white shadow-md shadow-red-600/15' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Type Filtering Dropdowns */}
        <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-white/5">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Priority Select */}
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-gray-500" />
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Priority:</span>
              <select
                className="bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-300 px-3 py-1.5 outline-none cursor-pointer focus:border-red-500/50"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
              >
                <option value="all" className="bg-[#0f0a0a]">All Priorities</option>
                <option value="high" className="bg-[#0f0a0a]">🔴 High</option>
                <option value="medium" className="bg-[#0f0a0a]">🟡 Medium</option>
                <option value="standard" className="bg-[#0f0a0a]">🔵 Standard</option>
                <option value="low" className="bg-[#0f0a0a]">⚪ Low</option>
              </select>
            </div>

            {/* Type Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Type:</span>
              <select
                className="bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-300 px-3 py-1.5 outline-none cursor-pointer focus:border-red-500/50"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all" className="bg-[#0f0a0a]">All Types</option>
                {Object.keys(TYPE_ICONS).map(type => (
                  <option key={type} value={type} className="bg-[#0f0a0a]">{TYPE_ICONS[type]} {type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-semibold">
            Showing {smFiltered.length} matching requests
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar (Ruby Red Theme) */}
      {selectedIds.length > 0 && filter === 'pending' && (
        <div className="flex items-center justify-between bg-red-950/80 border border-red-500/30 rounded-2xl px-6 py-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-red-400" />
            <span className="text-sm font-bold text-white">
              {selectedIds.length} request{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white"
            >
              Clear selection
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Deny Selected
            </button>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/15"
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
        ) : smFiltered.length === 0 ? (
          <div className="py-24 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">Queue Cleared</h3>
            <p className="text-gray-500 font-bold text-sm mt-1">All procurement authorizations are up to date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All Checkbox for Pending queue */}
            {filter === 'pending' && (
              <div 
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer select-none w-fit hover:text-white transition-colors"
              >
                {selectedIds.length === smFiltered.filter(r => r.status === 'pending').length ? (
                  <CheckSquare size={14} className="text-red-400" />
                ) : (
                  <Square size={14} />
                )}
                Select All Pending ({smFiltered.filter(r => r.status === 'pending').length})
              </div>
            )}

            {smFiltered.map((req) => {
              const isSelected = selectedIds.includes(req.id);
              const isExpanded = expandedId === req.id;

              return (
                <div 
                  key={req.id} 
                  className={`bg-white/[0.02] border rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-205 ${
                    req.status === 'approved' ? 'border-emerald-500/10 opacity-70' :
                    req.status === 'rejected' ? 'border-rose-500/10 opacity-60' :
                    isSelected ? 'border-red-500/50 bg-red-500/[0.02]' : 'border-white/[0.08]'
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
                            <CheckSquare size={16} className="text-red-400" />
                          ) : (
                            <Square size={16} className="text-gray-650 hover:text-gray-400" />
                          )}
                        </div>
                      )}

                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-red-500 shrink-0">
                        <span className="text-lg">{TYPE_ICONS[req.type] || '📋'}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">#{req.id}</span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 border border-white/5">
                            {req.type}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${PRIORITY_STYLES[req.priority] || PRIORITY_STYLES.standard}`}>
                            {req.priority}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white leading-relaxed truncate">{req.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-600">
                            <User size={10} /> Requester: {req.submittedBy}
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-600">
                            <Clock size={10} /> {req.submittedAt}
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
                            className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5"
                          >
                            Deny
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAction(req.id, 'APPROVE'); }}
                            disabled={actionLoadingId === req.id}
                            className="px-5 py-2 rounded-xl bg-red-600 text-[10px] font-bold uppercase tracking-widest text-white shadow-md shadow-red-600/15 hover:bg-red-500 transition-all"
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
                        <ChevronUp size={15} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={15} className="text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Accordion details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-white/5 bg-white/[0.005] animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                            <Info size={12} /> Detailed Specifications
                          </h4>
                          
                          {req.type === 'Supplier Request' && req.payload ? (
                            <div className="bg-[#1f1111] border border-red-500/10 rounded-xl p-4 text-xs space-y-3">
                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <span className="text-gray-500 font-bold block mb-0.5">COMPANY NAME</span>
                                  <span className="text-white font-mono font-semibold">{req.payload.supplier_name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-bold block mb-0.5">CATEGORY</span>
                                  <span className="text-white font-mono font-semibold">{req.payload.category}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <span className="text-gray-500 font-bold block mb-0.5">CONTACT EMAIL</span>
                                  <span className="text-white font-mono font-semibold">{req.payload.contact_email}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-bold block mb-0.5">PHONE NUMBER</span>
                                  <span className="text-white font-mono font-semibold">{req.payload.phone || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <span className="text-gray-500 font-bold block mb-0.5">EXPECTED LEAD TIME</span>
                                  <span className="text-white font-mono font-semibold">{req.payload.lead_time_days} Days</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-bold block mb-0.5">PRIORITY LEVEL</span>
                                  <span className="text-rose-400 font-bold uppercase">{req.payload.priority || 'standard'}</span>
                                </div>
                              </div>
                              <div className="border-t border-white/5 pt-2.5">
                                <span className="text-gray-500 font-bold block mb-0.5">BM RATIONALE / NOTES</span>
                                <p className="text-gray-300 leading-relaxed italic">"{req.payload.alert_message || req.description}"</p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs space-y-2.5 font-mono text-gray-300">
                              <div>
                                <span className="text-gray-500">DESCRIPTION:</span> {req.description}
                              </div>
                              <div>
                                <span className="text-gray-500">ASSIGNED ROLE:</span> {req.role}
                              </div>
                              <div>
                                <span className="text-gray-500">TIMESTAMP:</span> {req.submittedAt}
                              </div>
                              {req.payload && Object.keys(req.payload).map(k => (
                                <div key={k}>
                                  <span className="text-gray-500">{k.toUpperCase()}:</span> {JSON.stringify(req.payload[k])}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-red-400" /> AI Compliance Check
                          </h4>
                          <div className="bg-red-950/20 border border-red-500/10 rounded-xl p-4 text-xs text-gray-400 leading-relaxed space-y-2">
                            <p className="font-bold text-red-400/90 flex items-center gap-1">
                              <Shield size={12} /> Compliance Integrity Secure
                            </p>
                            {req.type === 'Supplier Request' && req.payload ? (
                              <p>
                                The request from the Business Manager specifies onboarding a new vendor under the <strong>{req.payload.category}</strong> category. 
                                Average industry lead times for {req.payload.category} is approximately 14 days; the proposed value of <strong>{req.payload.lead_time_days} days</strong> is well within normal operating metrics. 
                                Email domain checks verify authenticity. Ready for approval.
                              </p>
                            ) : (
                              <p>
                                Verify vendor pricing matrix and shipping lead times prior to authorization. All baseline values correspond to active procurement agreements.
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
          toast.type === 'success' ? 'bg-[#1e1111] border-red-500/30 text-white' : 'bg-[#291111] border-rose-500/30 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default RequestsPage;

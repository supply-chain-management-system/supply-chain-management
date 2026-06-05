import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, handleRequestAction, bulkRequestAction } from '../../../redux/requestsSlice';
import { 
  BellRing, CheckCircle2, XCircle, Clock, ShieldAlert,
  ArrowRight, User, Activity, History, Search, X, Filter,
  CheckSquare, Square, ChevronDown, ChevronUp, Info, Sparkles, Shield
} from 'lucide-react';

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-600 border-red-200',
  medium: 'bg-slate-100 text-slate-600 border-slate-300',
  low: 'bg-gray-100 text-gray-500 border-gray-200',
  standard: 'bg-slate-50 text-slate-500 border-slate-200'
};

const TYPE_ICONS = {
  'Purchase Order': '🧾',
  'Stock Adjustment': '⚖️',
  'Transfer Request': '↔️',
  'Restock Request': '📦',
  'Production Run': '⚙️',
  'System Action': '🔧',
  'Supplier Request': '🤝'
};

const FactoryRequestsPage = () => {
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

  // Filter for requests relevant to Factory Manager
  const fmFiltered = requests.filter(r => {
    const isRelevantRole = r.role === 'factory_manager' ||
      ['Stock Adjustment', 'Production Run'].includes(r.type);
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
    const pendingFilteredIds = fmFiltered
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
    <div className="space-y-8 animate-in fade-in duration-500 text-gray-800">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-blue-650 bg-blue-600 rounded-full" />
            <h1 className="text-3xl font-black tracking-tighter uppercase text-gray-900">Factory Operations Queue</h1>
          </div>
          <p className="text-gray-500 font-bold ml-4">Stock adjustments and assembly production directives portal.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} /> Production Line Online
          </div>
          <button 
            onClick={() => dispatch(fetchRequests())}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-all shadow-sm"
            title="Refresh Requests"
          >
            <History size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats and Filter Area */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search bar */}
          <div className="relative w-full lg:flex-1">
            <Search size={15} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests by ID, description, or type..."
              className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-250 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-900"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 w-full lg:w-auto overflow-x-auto">
            {['pending', 'approved', 'rejected', 'all'].map(tab => (
              <button
                key={tab}
                onClick={() => { setFilter(tab); setSelectedIds([]); }}
                className={`flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15' : 'text-gray-450 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Type Filtering Dropdowns */}
        <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Priority Select */}
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Priority:</span>
              <select
                className="bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-650 px-3 py-1.5 outline-none cursor-pointer focus:border-blue-500/50"
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
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Type:</span>
              <select
                className="bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-650 px-3 py-1.5 outline-none cursor-pointer focus:border-blue-500/50"
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

          <div className="text-xs text-gray-400 font-semibold">
            Showing {fmFiltered.length} matching requests
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && filter === 'pending' && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl px-6 py-4 animate-in slide-in-from-top duration-300 shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-blue-600" />
            <span className="text-sm font-bold text-blue-900">
              {selectedIds.length} directive{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-450 hover:text-gray-900"
            >
              Clear selection
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              Deny Selected
            </button>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/15"
            >
              Authorize Selected
            </button>
          </div>
        </div>
      )}

      {/* Requests Lists */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : fmFiltered.length === 0 ? (
          <div className="py-24 text-center bg-gray-50 border border-dashed border-gray-250 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wider text-gray-800">Queue Cleared</h3>
            <p className="text-gray-500 font-bold text-sm mt-1">All factory work directives and operations targets are up to date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All Checkbox for Pending queue */}
            {filter === 'pending' && (
              <div 
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer select-none w-fit hover:text-gray-950 transition-colors"
              >
                {selectedIds.length === fmFiltered.filter(r => r.status === 'pending').length ? (
                  <CheckSquare size={14} className="text-blue-600" />
                ) : (
                  <Square size={14} />
                )}
                Select All Pending ({fmFiltered.filter(r => r.status === 'pending').length})
              </div>
            )}

            {fmFiltered.map((req) => {
              const isSelected = selectedIds.includes(req.id);
              const isExpanded = expandedId === req.id;

              return (
                <div 
                  key={req.id} 
                  className={`bg-white border rounded-2xl overflow-hidden hover:border-gray-300 transition-all duration-200 shadow-sm ${
                    req.status === 'approved' ? 'border-emerald-500/10 opacity-70 bg-emerald-50/[0.01]' :
                    req.status === 'rejected' ? 'border-rose-500/10 opacity-60 bg-rose-50/[0.01]' :
                    isSelected ? 'border-blue-500/50 bg-blue-50/[0.02]' : 'border-gray-200'
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
                          className="shrink-0 p-1 hover:text-gray-900"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-blue-600" />
                          ) : (
                            <Square size={16} className="text-gray-300 hover:text-gray-450" />
                          )}
                        </div>
                      )}

                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <span className="text-lg">{TYPE_ICONS[req.type] || '📋'}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400">#{req.id}</span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-500 border border-gray-200">
                            {req.type}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${PRIORITY_STYLES[req.priority] || PRIORITY_STYLES.standard}`}>
                            {req.priority}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 leading-relaxed truncate">{req.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                            <User size={10} /> Requester: Business Manager
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
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
                            className="px-4 py-2 rounded-xl bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-200"
                          >
                            Deny
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAction(req.id, 'APPROVE'); }}
                            disabled={actionLoadingId === req.id}
                            className="px-5 py-2 rounded-xl bg-blue-600 text-[10px] font-bold uppercase tracking-widest text-white shadow-md shadow-blue-600/15 hover:bg-blue-755 transition-all"
                          >
                            {actionLoadingId === req.id ? '...' : 'Authorize'}
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-50 border-rose-100'
                        }`}>
                          {req.status === 'approved' ? '✓ Authorized' : '✕ Denied'}
                        </span>
                      )}

                      {isExpanded ? (
                        <ChevronUp size={15} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={15} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-gray-50/30 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                            <Info size={12} />
                            {req.type === 'Production Run' ? 'Production Run Specifications' : 'Production Directive Specifications'}
                          </h4>
                          
                          <div className="bg-white border border-gray-150 rounded-xl p-4 text-xs space-y-3">
                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <span className="text-gray-400 font-bold block mb-0.5">PRODUCT TO PRODUCE</span>
                                <span className="text-gray-900 font-mono font-semibold">{req.payload?.product_name || req.payload?.department || '—'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 font-bold block mb-0.5">TARGET OUTPUT</span>
                                <span className="text-blue-600 font-mono font-bold">{req.payload?.target_output || 100} Units</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <span className="text-gray-400 font-bold block mb-0.5">DEPARTMENT</span>
                                <span className="text-gray-900 font-mono font-semibold">{req.payload?.department || 'Assembly'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 font-bold block mb-0.5">SHIFT</span>
                                <span className="text-gray-900 font-mono font-semibold">{req.payload?.shift || 'Day Shift'}</span>
                              </div>
                            </div>
                            <div className="border-t border-gray-100 pt-2.5">
                              <span className="text-gray-400 font-bold block mb-0.5">NOTES</span>
                              <p className="text-gray-650 leading-relaxed italic">"{req.payload?.alert_message || req.description}"</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-indigo-500" /> Action Preview on Approval
                          </h4>
                          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 text-xs text-gray-600 leading-relaxed space-y-2">
                            <p className="font-bold text-indigo-700 flex items-center gap-1">
                              <Shield size={12} /> Machinery Capacity Verified
                            </p>
                            {(req.type === 'Production Run' || req.type === 'Stock Adjustment') ? (
                              <p>
                                Approving this will create a <strong>production job</strong> for{' '}
                                <strong>{req.payload?.product_name || `${req.payload?.department} Directive`}</strong>{' '}
                                targeting <strong>{req.payload?.target_output || 100} units</strong> in the{' '}
                                <strong>{req.payload?.department || 'Assembly'}</strong> on the{' '}
                                <strong>{req.payload?.shift || 'Day Shift'}</strong>.
                                Active machinery will be allocated upon FM confirmation.
                              </p>
                            ) : (
                              <p>Directive verification complete. Production line metrics indicate target loads are well within baseline safety parameters.</p>
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
          toast.type === 'success' ? 'bg-[#f0f9ff] border-blue-300 text-blue-900' : 'bg-[#fff5f5] border-rose-300 text-rose-900'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default FactoryRequestsPage;

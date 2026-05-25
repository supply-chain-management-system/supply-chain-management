import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, X, RefreshCw, AlertTriangle, CheckCircle2, 
  Send, Trash2, Clock, Shield, Star, ShieldAlert,
  Search, SlidersHorizontal, ChevronDown, ChevronUp,
  Check, Info, Sparkles, Filter, CheckSquare, Square,
  Building, Warehouse, Truck, Factory, PlusCircle, ArrowRight
} from 'lucide-react';
import { fetchRequests, handleRequestAction, bulkRequestAction } from '../../../redux/requestsSlice';
import api from '../../../api/api';

const PRIORITY_STYLES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-white/5 text-gray-400 border-white/10',
  standard: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

const TYPE_ICONS = {
  'Purchase Order': '🧾',
  'Stock Adjustment': '⚖️',
  'Transfer Request': '↔️',
  'Restock Request': '📦',
  'System Action': '⚙️',
  'Supplier Request': '🤝'
};

const CATEGORIES = [
  'Electronics', 'Raw Material', 'Hydraulics', 'Plastics',
  'Chemicals', 'Packaging', 'Textiles', 'Machinery'
];

const RequestsPage = () => {
  const dispatch = useDispatch();
  const { items: requests, loading, actionLoadingId } = useSelector(s => s.requests);

  // Sub-Manager Sub-Page Toggles
  const [managerTab, setManagerTab] = useState('SM'); // 'SM' | 'FM' | 'WM' | 'LM'

  // Sub-filter status states
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);

  // Draft form states per sub-page
  const [smForm, setSmForm] = useState(() => {
    const saved = localStorage.getItem('bm_subpage_sm_draft');
    return saved ? JSON.parse(saved) : {
      name: '',
      contact_email: '',
      phone: '',
      category: 'Electronics',
      lead_time_days: 14,
      priority: 'standard',
      description: ''
    };
  });

  const [fmForm, setFmForm] = useState(() => {
    const saved = localStorage.getItem('bm_subpage_fm_draft');
    return saved ? JSON.parse(saved) : {
      department: 'Assembly',
      shift: 'Day Shift',
      target_output: 100,
      priority: 'standard',
      description: ''
    };
  });

  const [wmForm, setWmForm] = useState(() => {
    const saved = localStorage.getItem('bm_subpage_wm_draft');
    return saved ? JSON.parse(saved) : {
      product_name: '',
      qty: 100,
      threshold: 50,
      priority: 'standard',
      description: ''
    };
  });

  const [lmForm, setLmForm] = useState(() => {
    const saved = localStorage.getItem('bm_subpage_lm_draft');
    return saved ? JSON.parse(saved) : {
      route: 'Domestic',
      sku: '',
      ship_qty: 250,
      priority: 'standard',
      description: ''
    };
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Sync Draft States
  useEffect(() => {
    localStorage.setItem('bm_subpage_sm_draft', JSON.stringify(smForm));
  }, [smForm]);

  useEffect(() => {
    localStorage.setItem('bm_subpage_fm_draft', JSON.stringify(fmForm));
  }, [fmForm]);

  useEffect(() => {
    localStorage.setItem('bm_subpage_wm_draft', JSON.stringify(wmForm));
  }, [wmForm]);

  useEffect(() => {
    localStorage.setItem('bm_subpage_lm_draft', JSON.stringify(lmForm));
  }, [lmForm]);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async (id, action) => {
    try {
      await dispatch(handleRequestAction({ requestId: id, action: action.toUpperCase() })).unwrap();
      showToast(`Request #${id} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, action === 'approve' ? 'success' : 'error');
    } catch (err) {
      showToast(err?.detail || `Failed to process request #${id}`, 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await dispatch(bulkRequestAction({ ids: selectedIds, action: action.toUpperCase() })).unwrap();
      showToast(`Bulk processed ${selectedIds.length} requests successfully.`, action === 'approve' ? 'success' : 'error');
      setSelectedIds([]);
    } catch (err) {
      showToast(err?.detail || 'Bulk action failed.', 'error');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    let payload = {};

    if (managerTab === 'SM') {
      if (!smForm.name || !smForm.contact_email || !smForm.description) {
        showToast("Please fill all required fields", "error");
        setSubmitLoading(false);
        return;
      }
      payload = {
        type: "Supplier Request",
        role: "supply_manager",
        priority: smForm.priority,
        description: smForm.description,
        name: smForm.name,
        contact_email: smForm.contact_email,
        phone: smForm.phone || undefined,
        category: smForm.category,
        lead_time_days: parseInt(smForm.lead_time_days) || 14
      };
    } else if (managerTab === 'FM') {
      if (!fmForm.description) {
        showToast("Please fill all required fields", "error");
        setSubmitLoading(false);
        return;
      }
      payload = {
        type: "Stock Adjustment",
        role: "factory_manager",
        priority: fmForm.priority,
        description: `[FM Directives] Dept: ${fmForm.department}, Shift: ${fmForm.shift}, Target Output: ${fmForm.target_output}. Notes: ${fmForm.description}`
      };
    } else if (managerTab === 'WM') {
      if (!wmForm.product_name || !wmForm.description) {
        showToast("Please fill all required fields", "error");
        setSubmitLoading(false);
        return;
      }
      payload = {
        type: "Restock Request",
        role: "warehouse_manager",
        priority: wmForm.priority,
        description: `[WM Directives] Product: ${wmForm.product_name}, Replenish Quantity: ${wmForm.qty}, Threshold: ${wmForm.threshold}. Notes: ${wmForm.description}`
      };
    } else if (managerTab === 'LM') {
      if (!lmForm.sku || !lmForm.description) {
        showToast("Please fill all required fields", "error");
        setSubmitLoading(false);
        return;
      }
      payload = {
        type: "Transfer Request",
        role: "logistics_manager",
        priority: lmForm.priority,
        description: `[LM Directives] Shipping Route: ${lmForm.route}, Transfer SKU: ${lmForm.sku}, Dispatch Quantity: ${lmForm.ship_qty}. Notes: ${lmForm.description}`
      };
    }

    try {
      await api.post('/business-manager/requests', payload);
      showToast("Request / Directive successfully sent to database!", "success");

      // Reset Draft
      if (managerTab === 'SM') {
        localStorage.removeItem('bm_subpage_sm_draft');
        setSmForm({
          name: '',
          contact_email: '',
          phone: '',
          category: 'Electronics',
          lead_time_days: 14,
          priority: 'standard',
          description: ''
        });
      } else if (managerTab === 'FM') {
        localStorage.removeItem('bm_subpage_fm_draft');
        setFmForm({
          department: 'Assembly',
          shift: 'Day Shift',
          target_output: 100,
          priority: 'standard',
          description: ''
        });
      } else if (managerTab === 'WM') {
        localStorage.removeItem('bm_subpage_wm_draft');
        setWmForm({
          product_name: '',
          qty: 100,
          threshold: 50,
          priority: 'standard',
          description: ''
        });
      } else if (managerTab === 'LM') {
        localStorage.removeItem('bm_subpage_lm_draft');
        setLmForm({
          route: 'Domestic',
          sku: '',
          ship_qty: 250,
          priority: 'standard',
          description: ''
        });
      }

      dispatch(fetchRequests());
    } catch (err) {
      showToast(err.response?.data?.detail || "Request creation failed.", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Map managerTab to role identifier stored in request payloads
  const getRoleForTab = () => {
    if (managerTab === 'SM') return 'supply_manager';
    if (managerTab === 'FM') return 'factory_manager';
    if (managerTab === 'WM') return 'warehouse_manager';
    if (managerTab === 'LM') return 'logistics_manager';
    return '';
  };

  // Filter requests specifically relevant to the active sub-page manager role
  const targetRole = getRoleForTab();
  const managerRequests = requests.filter(req => {
    const matchesRole = req.role === targetRole || 
                        (targetRole === 'supply_manager' && !req.role) ||
                        (targetRole === 'warehouse_manager' && (req.type === 'Restock Request' || req.role === 'System Agent'));
    const matchesStatus = filter === 'all' ? true : req.status === filter;
    const matchesPriority = priorityFilter === 'all' ? true : req.priority === priorityFilter;
    const matchesSearch = 
      req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id?.toString().includes(searchQuery);

    return matchesRole && matchesStatus && matchesPriority && matchesSearch;
  });

  const getStats = (roleStr) => {
    const filtered = requests.filter(r => 
      r.role === roleStr || 
      (roleStr === 'supply_manager' && !r.role) ||
      (roleStr === 'warehouse_manager' && (r.type === 'Restock Request' || r.role === 'System Agent'))
    );
    return {
      pending: filtered.filter(r => r.status === 'pending').length,
      approved: filtered.filter(r => r.status === 'approved').length,
      rejected: filtered.filter(r => r.status === 'rejected').length
    };
  };

  const currentStats = getStats(targetRole);

  const handleSelectAll = () => {
    const pendingFilteredIds = managerRequests
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

  const inputCls = "w-full border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 bg-[#070b13] text-white placeholder:text-gray-650";
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Request Authorization Center</h1>
          </div>
          <p className="text-gray-500 text-xs mt-0.5 ml-4">Dispatch and action dedicated sub-manager requests in real-time</p>
        </div>
        <button 
          onClick={() => dispatch(fetchRequests())}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all self-end md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 4 Dedicated Manager Toggles / Sub-pages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { id: 'SM', name: 'Supplier Manager', icon: Building, color: 'border-rose-500/20 hover:border-rose-500/40 text-rose-400 bg-rose-500/5' },
          { id: 'FM', name: 'Factory Manager', icon: Factory, color: 'border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 bg-indigo-500/5' },
          { id: 'WM', name: 'Warehouse Manager', icon: Warehouse, color: 'border-amber-500/20 hover:border-amber-500/40 text-amber-400 bg-amber-500/5' },
          { id: 'LM', name: 'Logistics Manager', icon: Truck, color: 'border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 bg-emerald-500/5' }
        ].map(tab => {
          const isActive = managerTab === tab.id;
          const stats = getStats(tab.id === 'SM' ? 'supply_manager' : tab.id === 'FM' ? 'factory_manager' : tab.id === 'WM' ? 'warehouse_manager' : 'logistics_manager');
          return (
            <button
              key={tab.id}
              onClick={() => { setManagerTab(tab.id); setSelectedIds([]); }}
              className={`border text-left p-4 rounded-2xl transition-all relative overflow-hidden ${
                isActive 
                  ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/30' 
                  : 'bg-white/[0.01] border-white/[0.08] hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <tab.icon size={20} className={isActive ? 'text-cyan-400' : 'text-gray-400'} />
                <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-md font-bold text-gray-400">
                  {stats.pending} pending
                </span>
              </div>
              <h3 className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {tab.name}
              </h3>
              <p className="text-[9px] text-gray-500 mt-0.5">
                {stats.approved} approved · {stats.rejected} rejected
              </p>
            </button>
          );
        })}
      </div>

      {/* Main split dashboard per selected subpage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dedicated Form */}
        <div className="lg:col-span-5 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 h-fit space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-white/5">
            <span className="text-xl">✍️</span>
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-wide">
                {managerTab === 'SM' ? 'Add New Supplier Flow' :
                 managerTab === 'FM' ? 'Factory Directive Portal' :
                 managerTab === 'WM' ? 'Warehouse Stock Directives' :
                 'Logistics Cargo Dispatch'}
              </h2>
              <p className="text-[10px] text-gray-500">
                {managerTab === 'SM' ? 'Dispatches an onboarding ticket to SM approval queue' :
                 'Broadcast custom operations directive to team'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-3.5">
            
            {/* ─── SM FORM ─── */}
            {managerTab === 'SM' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Company Name <span className="text-red-400">*</span></label>
                    <input 
                      required
                      className={inputCls}
                      placeholder="e.g. Apex Metals"
                      value={smForm.name}
                      onChange={e => setSmForm({ ...smForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Email <span className="text-red-400">*</span></label>
                    <input 
                      required
                      type="email"
                      className={inputCls}
                      placeholder="info@company.com"
                      value={smForm.contact_email}
                      onChange={e => setSmForm({ ...smForm, contact_email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select 
                      className={inputCls}
                      value={smForm.category}
                      onChange={e => setSmForm({ ...smForm, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#070b13]">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Lead Time (Days)</label>
                    <input 
                      type="number"
                      min="1"
                      className={inputCls}
                      value={smForm.lead_time_days}
                      onChange={e => setSmForm({ ...smForm, lead_time_days: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input 
                      className={inputCls}
                      placeholder="+1 555-0199"
                      value={smForm.phone}
                      onChange={e => setSmForm({ ...smForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select 
                      className={inputCls}
                      value={smForm.priority}
                      onChange={e => setSmForm({ ...smForm, priority: e.target.value })}
                    >
                      <option value="high">🔴 High Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="standard">🔵 Standard Priority</option>
                      <option value="low">⚪ Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Rationale Description <span className="text-red-400">*</span></label>
                  <textarea 
                    required
                    className={`${inputCls} min-h-[80px] resize-none`}
                    placeholder="Provide onboarding context and reason for registration..."
                    value={smForm.description}
                    onChange={e => setSmForm({ ...smForm, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* ─── FM FORM (Teammate placeholder but fully functional) ─── */}
            {managerTab === 'FM' && (
              <div className="space-y-3">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-[10px] text-indigo-400 leading-relaxed mb-1">
                  💡 <strong>Teammate Integration Draft:</strong> The factory automation schema is currently managed by other teammates. Standard custom shift directive payloads are enabled.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Department Scope</label>
                    <select 
                      className={inputCls}
                      value={fmForm.department}
                      onChange={e => setFmForm({ ...fmForm, department: e.target.value })}
                    >
                      <option value="Assembly">Assembly Line</option>
                      <option value="Quality Control">Quality Control</option>
                      <option value="Paint Shop">Paint Shop</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select 
                      className={inputCls}
                      value={fmForm.priority}
                      onChange={e => setFmForm({ ...fmForm, priority: e.target.value })}
                    >
                      <option value="high">🔴 High Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="standard">🔵 Standard Priority</option>
                      <option value="low">⚪ Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Directive Details <span className="text-red-400">*</span></label>
                  <textarea 
                    required
                    className={`${inputCls} min-h-[100px] resize-none`}
                    placeholder="Describe adjustment requirements..."
                    value={fmForm.description}
                    onChange={e => setFmForm({ ...fmForm, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* ─── WM FORM (Teammate placeholder but fully functional) ─── */}
            {managerTab === 'WM' && (
              <div className="space-y-3">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-400 leading-relaxed mb-1">
                  💡 <strong>Teammate Integration Draft:</strong> The warehouse automation schema is managed by other teammates. Replenishment directives can be drafted below.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                    <input 
                      required
                      className={inputCls}
                      placeholder="e.g. Copper Sheets"
                      value={wmForm.product_name}
                      onChange={e => setWmForm({ ...wmForm, product_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select 
                      className={inputCls}
                      value={wmForm.priority}
                      onChange={e => setWmForm({ ...wmForm, priority: e.target.value })}
                    >
                      <option value="high">🔴 High Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="standard">🔵 Standard Priority</option>
                      <option value="low">⚪ Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Directive Description <span className="text-red-400">*</span></label>
                  <textarea 
                    required
                    className={`${inputCls} min-h-[100px] resize-none`}
                    placeholder="Provide replenishment details..."
                    value={wmForm.description}
                    onChange={e => setWmForm({ ...wmForm, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* ─── LM FORM (Teammate placeholder but fully functional) ─── */}
            {managerTab === 'LM' && (
              <div className="space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-[10px] text-emerald-400 leading-relaxed mb-1">
                  💡 <strong>Teammate Integration Draft:</strong> Logistics routes schema is currently managed by other teammates. Cargo dispatch directives can be sent below.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Transfer SKU <span className="text-red-400">*</span></label>
                    <input 
                      required
                      className={inputCls}
                      placeholder="SKU-B99"
                      value={lmForm.sku}
                      onChange={e => setLmForm({ ...lmForm, sku: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select 
                      className={inputCls}
                      value={lmForm.priority}
                      onChange={e => setLmForm({ ...lmForm, priority: e.target.value })}
                    >
                      <option value="high">🔴 High Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="standard">🔵 Standard Priority</option>
                      <option value="low">⚪ Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Shipment Instructions <span className="text-red-400">*</span></label>
                  <textarea 
                    required
                    className={`${inputCls} min-h-[100px] resize-none`}
                    placeholder="Specify route schedules or transport criteria..."
                    value={lmForm.description}
                    onChange={e => setLmForm({ ...lmForm, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitLoading}
              className="w-full h-10 mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-600/10 flex items-center justify-center gap-2"
            >
              {submitLoading ? (
                <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={12} />
                  <span>Dispatch Request</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Column: List of Requests specifically for this Manager */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* List controls */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              {/* Search input */}
              <div className="relative w-full sm:flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder={`Search ${managerTab} Requests...`}
                  className="w-full h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500/50"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Select Tabs */}
              <div className="flex gap-0.5 bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0 overflow-x-auto">
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setFilter(s); setSelectedIds([]); }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      filter === s ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

            </div>

            {/* Bulk actions inside the list */}
            {selectedIds.length > 0 && filter === 'pending' && (
              <div className="flex items-center justify-between bg-cyan-950/80 border border-cyan-500/30 rounded-xl px-4 py-2.5 animate-in slide-in-from-top-1">
                <span className="text-xs font-bold text-white">
                  {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-500/25 text-red-400 hover:bg-red-500/10"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg"
                  >
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actual Requests Roster */}
          <div className="space-y-3">
            {managerRequests.length === 0 ? (
              <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-12 text-center text-xs text-gray-500 italic">
                No request history found for {managerTab} under the selected status filter.
              </div>
            ) : (
              <div className="space-y-2">
                {filter === 'pending' && (
                  <div 
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer select-none hover:text-white"
                  >
                    {selectedIds.length === managerRequests.filter(r => r.status === 'pending').length ? (
                      <CheckSquare size={12} className="text-cyan-400" />
                    ) : (
                      <Square size={12} />
                    )}
                    Select All Pending ({managerRequests.filter(r => r.status === 'pending').length})
                  </div>
                )}

                {managerRequests.map((req) => {
                  const isSelected = selectedIds.includes(req.id);
                  const isExpanded = expandedId === req.id;

                  return (
                    <div 
                      key={req.id} 
                      className={`bg-white/[0.02] border rounded-xl overflow-hidden hover:border-white/15 transition-all ${
                        req.status === 'approved' ? 'border-emerald-500/10 opacity-70' :
                        req.status === 'rejected' ? 'border-rose-500/10 opacity-60' :
                        isSelected ? 'border-cyan-500/50 bg-cyan-500/[0.02]' : 'border-white/[0.08]'
                      }`}
                    >
                      <div 
                        onClick={() => toggleExpandRow(req.id)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer select-none"
                      >
                        {filter === 'pending' && (
                          <div 
                            onClick={(e) => { e.stopPropagation(); handleSelectRow(req.id); }}
                            className="shrink-0 p-0.5 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare size={14} className="text-cyan-400" />
                            ) : (
                              <Square size={14} className="text-gray-650 hover:text-gray-400" />
                            )}
                          </div>
                        )}

                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-xl shrink-0 bg-white/5 w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-white/5">
                            {TYPE_ICONS[req.type] || '📋'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-gray-500">#{req.id}</span>
                              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded uppercase tracking-wider">{req.type}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider border ${PRIORITY_STYLES[req.priority] || PRIORITY_STYLES.standard}`}>
                                {req.priority}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-white leading-relaxed truncate">{req.description}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">
                              {req.submittedAt} · Status: <span className={req.status === 'approved' ? 'text-emerald-450 font-bold' : req.status === 'rejected' ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>{req.status}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {req.status === 'pending' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'reject'); }}
                                disabled={actionLoadingId === req.id}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAction(req.id, 'approve'); }}
                                disabled={actionLoadingId === req.id}
                                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                              >
                                {actionLoadingId === req.id ? '...' : 'Approve'}
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${
                              req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {req.status === 'approved' ? 'Authorized' : 'Rejected'}
                            </span>
                          )}

                          {isExpanded ? (
                            <ChevronUp size={14} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={14} className="text-gray-500" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0.5 border-t border-white/5 bg-white/[0.005]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="space-y-1">
                              <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                Request Details
                              </h4>
                              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-[11px] space-y-1.5 font-mono text-gray-300">
                                <div>
                                  <span className="text-gray-500">DESCRIPTION:</span> {req.description}
                                </div>
                                <div>
                                  <span className="text-gray-500">ASSIGNED ROLE:</span> {req.role}
                                </div>
                                <div>
                                  <span className="text-gray-500">SUBMITTED:</span> {req.submittedAt}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                Compliance & Logs
                              </h4>
                              <div className="bg-cyan-950/20 border border-cyan-500/10 rounded-lg p-3 text-[11px] text-gray-400 leading-relaxed">
                                Verification verified. No compliance anomalies detected. Action parameters match authorization protocol constraints.
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

        </div>

      </div>

      {/* Toast popup */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold border transition-all ${
          toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-white' : 'bg-red-950/80 border-red-500/30 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

    </div>
  );
};

export default RequestsPage;
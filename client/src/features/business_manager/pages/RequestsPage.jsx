import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  RefreshCw, Send, CheckCircle2, Clock,
  Search, ChevronDown, ChevronUp,
  CheckSquare, Square, Building, Warehouse, Truck, Factory,
  Package, LayoutGrid, PackagePlus, BoxSelect, Layers, Car, ArrowRight
} from 'lucide-react';
import { fetchRequests, handleRequestAction, bulkRequestAction } from '../../../redux/requestsSlice';
import api from '../../../api/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_STYLES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-white/5 text-gray-400 border-white/10',
  standard: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

const CATEGORIES = ['Electronics', 'Raw Material', 'Hydraulics', 'Plastics', 'Chemicals', 'Packaging', 'Textiles', 'Machinery'];
const PRODUCT_TYPES = ['finished_good', 'raw_material', 'component', 'packaging'];

// ─── Request Type Configs per Manager Tab ─────────────────────────────────────

const REQUEST_TYPES = {
  SM: [
    {
      id: 'Supplier Request',
      label: 'Add Supplier',
      icon: Building,
      desc: 'Onboard a new supplier into the supply chain',
      color: 'text-rose-400',
      fields: ['name', 'contact_email', 'phone', 'category', 'lead_time_days', 'priority', 'description']
    }
  ],
  WM: [
    {
      id: 'Restock Request',
      label: 'Restock Product',
      icon: Package,
      desc: 'Request replenishment of an existing product',
      color: 'text-amber-400',
      fields: ['product_name', 'qty', 'threshold', 'priority', 'description']
    },
    {
      id: 'Add Product',
      label: 'Add New Product',
      icon: PackagePlus,
      desc: 'Request WM to add a brand-new product to catalog',
      color: 'text-amber-400',
      fields: ['product_name', 'sku', 'product_type', 'product_cost', 'product_price', 'product_weight', 'threshold', 'priority', 'description']
    },
    {
      id: 'Add Rack',
      label: 'Add New Rack',
      icon: Layers,
      desc: 'Request WM to add a new storage rack to warehouse',
      color: 'text-amber-400',
      fields: ['rack_name', 'rack_zone', 'rack_rows', 'rack_max_weight', 'priority', 'description']
    }
  ],
  FM: [
    {
      id: 'Production Run',
      label: 'Start Production Run',
      icon: LayoutGrid,
      desc: 'Request FM to start a new production run',
      color: 'text-indigo-400',
      fields: ['product_name', 'target_output', 'department', 'shift', 'priority', 'description']
    }
  ],
  LM: [
    {
      id: 'Transfer Request',
      label: 'Create Shipment',
      icon: Truck,
      desc: 'Request LM to dispatch a new cargo shipment',
      color: 'text-emerald-400',
      fields: ['sku', 'route', 'ship_qty', 'priority', 'description']
    },
    {
      id: 'Add Vehicle',
      label: 'Add Fleet Vehicle',
      icon: Car,
      desc: 'Request LM to register a new vehicle to fleet',
      color: 'text-emerald-400',
      fields: ['fleet_id', 'vehicle_type', 'vehicle_capacity', 'driver_name', 'route', 'stop_warehouse_name', 'priority', 'description']
    }
  ]
};

// ─── Default Form State ────────────────────────────────────────────────────────

const defaultForms = {
  'Supplier Request': { name: '', contact_email: '', phone: '', category: 'Electronics', lead_time_days: 14, priority: 'standard', description: '' },
  'Restock Request': { product_name: '', qty: 100, threshold: 50, priority: 'standard', description: '' },
  'Add Product': { product_name: '', sku: '', product_type: 'finished_good', product_cost: 0, product_price: 0, product_weight: 1.0, threshold: 10, priority: 'standard', description: '' },
  'Add Rack': { rack_name: '', rack_zone: 'General', rack_rows: 5, rack_max_weight: 5000, priority: 'standard', description: '' },
  'Production Run': { product_name: '', target_output: 100, department: 'Assembly', shift: 'Day Shift', priority: 'standard', description: '' },
  'Transfer Request': { sku: '', route: 'Domestic', ship_qty: 250, priority: 'standard', description: '' },
  'Add Vehicle': { fleet_id: '', vehicle_type: 'Truck', vehicle_capacity: 5000, driver_name: '', route: 'Domestic', stop_warehouse_name: 'Main Warehouse', priority: 'standard', description: '' }
};

const TYPE_ICONS = {
  'Supplier Request': '🤝',
  'Restock Request': '📦',
  'Add Product': '🏷️',
  'Add Rack': '🗂️',
  'Production Run': '⚙️',
  'Stock Adjustment': '⚖️',
  'Transfer Request': '↔️',
  'Add Vehicle': '🚛',
  'System Action': '🔧'
};

const ROLE_MAP = {
  SM: 'supply_manager',
  FM: 'factory_manager',
  WM: 'warehouse_manager',
  LM: 'logistics_manager'
};

// ─── Main Component ─────────────────────────────────────────────────────────────

const RequestsPage = () => {
  const dispatch = useDispatch();
  const { items: requests, loading, actionLoadingId } = useSelector(s => s.requests);

  const [managerTab, setManagerTab] = useState('SM');
  const [activeType, setActiveType] = useState('Supplier Request');
  const [formData, setFormData] = useState({ ...defaultForms['Supplier Request'] });

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  // When tab changes, auto-select first request type
  const switchTab = (tab) => {
    setManagerTab(tab);
    setSelectedIds([]);
    const firstType = REQUEST_TYPES[tab][0];
    setActiveType(firstType.id);
    setFormData({ ...defaultForms[firstType.id] });
  };

  const switchType = (typeId) => {
    setActiveType(typeId);
    setFormData({ ...defaultForms[typeId] });
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) {
      showToast('Please provide a description / rationale.', 'error');
      return;
    }
    setSubmitLoading(true);
    try {
      const payload = {
        type: activeType,
        role: ROLE_MAP[managerTab],
        priority: formData.priority || 'standard',
        description: formData.description,
        ...formData
      };
      await api.post('/business-manager/requests', payload);
      showToast(`"${activeType}" request dispatched to ${managerTab} approval queue!`, 'success');
      setFormData({ ...defaultForms[activeType] });
      dispatch(fetchRequests());
    } catch (err) {
      showToast(err.response?.data?.detail || 'Request failed.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await dispatch(handleRequestAction({ requestId: id, action: action.toUpperCase() })).unwrap();
      showToast(`Request #${id} ${action === 'approve' ? 'approved' : 'rejected'}.`, action === 'approve' ? 'success' : 'error');
    } catch (err) {
      showToast(err?.detail || `Failed to process #${id}`, 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectedIds.length) return;
    try {
      await dispatch(bulkRequestAction({ ids: selectedIds, action: action.toUpperCase() })).unwrap();
      showToast(`Bulk processed ${selectedIds.length} requests.`, action === 'approve' ? 'success' : 'error');
      setSelectedIds([]);
    } catch (err) {
      showToast(err?.detail || 'Bulk failed.', 'error');
    }
  };

  const toggleExpandRow = (id) => setExpandedId(prev => prev === id ? null : id);

  const targetRole = ROLE_MAP[managerTab];
  const managerRequests = requests.filter(req => {
    const matchesRole = req.role === targetRole ||
      (targetRole === 'warehouse_manager' && req.role === 'System Agent');
    const matchesStatus = filter === 'all' || req.status === filter;
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
    const matchesSearch =
      req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id?.toString().includes(searchQuery);
    return matchesRole && matchesStatus && matchesPriority && matchesSearch;
  });

  const getStats = (roleStr) => {
    const f = requests.filter(r =>
      r.role === roleStr ||
      (roleStr === 'warehouse_manager' && r.role === 'System Agent')
    );
    return {
      pending: f.filter(r => r.status === 'pending').length,
      approved: f.filter(r => r.status === 'approved').length,
    };
  };

  const inp = "w-full border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-cyan-500 bg-[#070b13] text-white placeholder:text-slate-500";
  const lbl = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1";

  const currentTypes = REQUEST_TYPES[managerTab];
  const activeTypeCfg = currentTypes.find(t => t.id === activeType) || currentTypes[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Request Authorization Center</h1>
          </div>
          <p className="text-slate-500 text-xs mt-0.5 ml-4">Dispatch actions to sub-managers — they approve or reject in their own portal</p>
        </div>
        <button
          onClick={() => dispatch(fetchRequests())}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Manager Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { id: 'SM', name: 'Supplier Manager', icon: Building, role: 'supply_manager' },
          { id: 'FM', name: 'Factory Manager', icon: Factory, role: 'factory_manager' },
          { id: 'WM', name: 'Warehouse Manager', icon: Warehouse, role: 'warehouse_manager' },
          { id: 'LM', name: 'Logistics Manager', icon: Truck, role: 'logistics_manager' }
        ].map(tab => {
          const isActive = managerTab === tab.id;
          const stats = getStats(tab.role);
          const typeCount = REQUEST_TYPES[tab.id].length;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`border text-left p-4 rounded-2xl transition-all relative overflow-hidden ${
                isActive
                  ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/30'
                  : 'bg-white/[0.01] border-white/[0.08] hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <tab.icon size={20} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-md font-bold text-slate-400">
                    {stats.pending} pending
                  </span>
                  <span className="text-[9px] text-slate-600 font-bold">{typeCount} request type{typeCount > 1 ? 's' : ''}</span>
                </div>
              </div>
              <h3 className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {tab.name}
              </h3>
              <p className="text-[9px] text-slate-500 mt-0.5">
                {stats.approved} approved
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: Form Panel ── */}
        <div className="lg:col-span-5 space-y-3">

          {/* Request Type Switcher */}
          {currentTypes.length > 1 && (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-3 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1">Select Request Type</p>
              <div className="space-y-1.5">
                {currentTypes.map(t => {
                  const isSelected = activeType === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => switchType(t.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                          : 'bg-white/[0.01] border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
                        <t.icon size={14} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold">{t.label}</p>
                        <p className="text-[9px] text-slate-500 leading-none mt-0.5">{t.desc}</p>
                      </div>
                      {isSelected && <ArrowRight size={12} className="text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <span className="text-xl">{TYPE_ICONS[activeType] || '✍️'}</span>
              <div>
                <h2 className="text-sm font-black uppercase text-white tracking-wide">{activeTypeCfg?.label}</h2>
                <p className="text-[10px] text-slate-500">{activeTypeCfg?.desc}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* ─── Supplier Request ─── */}
              {activeType === 'Supplier Request' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Company Name <span className="text-red-400">*</span></label>
                      <input required className={inp} placeholder="e.g. Apex Metals" value={formData.name || ''} onChange={e => updateField('name', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Contact Email <span className="text-red-400">*</span></label>
                      <input required type="email" className={inp} placeholder="info@company.com" value={formData.contact_email || ''} onChange={e => updateField('contact_email', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Category</label>
                      <select className={inp} value={formData.category || 'Electronics'} onChange={e => updateField('category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#070b13]">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Lead Time (Days)</label>
                      <input type="number" min="1" className={inp} value={formData.lead_time_days || 14} onChange={e => updateField('lead_time_days', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Phone</label>
                      <input className={inp} placeholder="+1 555-0199" value={formData.phone || ''} onChange={e => updateField('phone', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Priority</label>
                      <select className={inp} value={formData.priority || 'standard'} onChange={e => updateField('priority', e.target.value)}>
                        <option value="high" className="bg-[#070b13]">🔴 High</option>
                        <option value="medium" className="bg-[#070b13]">🟡 Medium</option>
                        <option value="standard" className="bg-[#070b13]">🔵 Standard</option>
                        <option value="low" className="bg-[#070b13]">⚪ Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Restock Request ─── */}
              {activeType === 'Restock Request' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Product Name <span className="text-red-400">*</span></label>
                      <input required className={inp} placeholder="e.g. Copper Sheets" value={formData.product_name || ''} onChange={e => updateField('product_name', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Replenish Qty</label>
                      <input type="number" min="1" className={inp} value={formData.qty || 100} onChange={e => updateField('qty', parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Min Stock Threshold</label>
                      <input type="number" min="0" className={inp} value={formData.threshold || 50} onChange={e => updateField('threshold', parseInt(e.target.value))} />
                    </div>
                    <div>
                      <label className={lbl}>Priority</label>
                      <select className={inp} value={formData.priority || 'standard'} onChange={e => updateField('priority', e.target.value)}>
                        <option value="high" className="bg-[#070b13]">🔴 High</option>
                        <option value="medium" className="bg-[#070b13]">🟡 Medium</option>
                        <option value="standard" className="bg-[#070b13]">🔵 Standard</option>
                        <option value="low" className="bg-[#070b13]">⚪ Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Add Product ─── */}
              {activeType === 'Add Product' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Product Name <span className="text-red-400">*</span></label>
                      <input required className={inp} placeholder="e.g. Steel Rod 12mm" value={formData.product_name || ''} onChange={e => updateField('product_name', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>SKU (auto-gen if blank)</label>
                      <input className={inp} placeholder="SKU-AB1234" value={formData.sku || ''} onChange={e => updateField('sku', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Product Type</label>
                      <select className={inp} value={formData.product_type || 'finished_good'} onChange={e => updateField('product_type', e.target.value)}>
                        {PRODUCT_TYPES.map(t => <option key={t} value={t} className="bg-[#070b13]">{t.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Min Stock Level</label>
                      <input type="number" min="0" className={inp} value={formData.threshold || 10} onChange={e => updateField('threshold', parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={lbl}>Cost ($)</label>
                      <input type="number" min="0" step="0.01" className={inp} value={formData.product_cost || 0} onChange={e => updateField('product_cost', parseFloat(e.target.value))} />
                    </div>
                    <div>
                      <label className={lbl}>Price ($)</label>
                      <input type="number" min="0" step="0.01" className={inp} value={formData.product_price || 0} onChange={e => updateField('product_price', parseFloat(e.target.value))} />
                    </div>
                    <div>
                      <label className={lbl}>Weight (kg)</label>
                      <input type="number" min="0" step="0.1" className={inp} value={formData.product_weight || 1} onChange={e => updateField('product_weight', parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Priority</label>
                    <select className={inp} value={formData.priority || 'standard'} onChange={e => updateField('priority', e.target.value)}>
                      <option value="high" className="bg-[#070b13]">🔴 High</option>
                      <option value="medium" className="bg-[#070b13]">🟡 Medium</option>
                      <option value="standard" className="bg-[#070b13]">🔵 Standard</option>
                      <option value="low" className="bg-[#070b13]">⚪ Low</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ─── Add Rack ─── */}
              {activeType === 'Add Rack' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Rack Name <span className="text-red-400">*</span></label>
                      <input required className={inp} placeholder="e.g. Rack B4" value={formData.rack_name || ''} onChange={e => updateField('rack_name', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Zone / Section</label>
                      <input className={inp} placeholder="e.g. Zone A, Cold Storage" value={formData.rack_zone || ''} onChange={e => updateField('rack_zone', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Number of Rows</label>
                      <input type="number" min="1" className={inp} value={formData.rack_rows || 5} onChange={e => updateField('rack_rows', parseInt(e.target.value))} />
                    </div>
                    <div>
                      <label className={lbl}>Max Weight (kg)</label>
                      <input type="number" min="0" step="100" className={inp} value={formData.rack_max_weight || 5000} onChange={e => updateField('rack_max_weight', parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Priority</label>
                    <select className={inp} value={formData.priority || 'standard'} onChange={e => updateField('priority', e.target.value)}>
                      <option value="high" className="bg-[#070b13]">🔴 High</option>
                      <option value="medium" className="bg-[#070b13]">🟡 Medium</option>
                      <option value="standard" className="bg-[#070b13]">🔵 Standard</option>
                      <option value="low" className="bg-[#070b13]">⚪ Low</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ─── Production Run ─── */}
              {activeType === 'Production Run' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Product to Produce <span className="text-red-400">*</span></label>
                      <input required className={inp} placeholder="e.g. Gear Assembly X" value={formData.product_name || ''} onChange={e => updateField('product_name', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Target Output (units)</label>
                      <input type="number" min="1" className={inp} value={formData.target_output || 100} onChange={e => updateField('target_output', parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Department</label>
                      <select className={inp} value={formData.department || 'Assembly'} onChange={e => updateField('department', e.target.value)}>
                        <option className="bg-[#070b13]">Assembly</option>
                        <option className="bg-[#070b13]">Quality Control</option>
                        <option className="bg-[#070b13]">Paint Shop</option>
                        <option className="bg-[#070b13]">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Shift</label>
                      <select className={inp} value={formData.shift || 'Day Shift'} onChange={e => updateField('shift', e.target.value)}>
                        <option className="bg-[#070b13]">Day Shift</option>
                        <option className="bg-[#070b13]">Night Shift</option>
                        <option className="bg-[#070b13]">Double Shift</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Priority</label>
                    <select className={inp} value={formData.priority || 'standard'} onChange={e => updateField('priority', e.target.value)}>
                      <option value="high" className="bg-[#070b13]">🔴 High</option>
                      <option value="medium" className="bg-[#070b13]">🟡 Medium</option>
                      <option value="standard" className="bg-[#070b13]">🔵 Standard</option>
                      <option value="low" className="bg-[#070b13]">⚪ Low</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ─── Transfer Request ─── */}
              {activeType === 'Transfer Request' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Product SKU <span className="text-red-400">*</span></label>
                      <input required className={inp} placeholder="SKU-B99" value={formData.sku || ''} onChange={e => updateField('sku', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Dispatch Qty (units)</label>
                      <input type="number" min="1" className={inp} value={formData.ship_qty || 250} onChange={e => updateField('ship_qty', parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Shipping Route</label>
                      <select className={inp} value={formData.route || 'Domestic'} onChange={e => updateField('route', e.target.value)}>
                        <option className="bg-[#070b13]">Domestic</option>
                        <option className="bg-[#070b13]">International</option>
                        <option className="bg-[#070b13]">Express</option>
                        <option className="bg-[#070b13]">Economy</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Priority</label>
                      <select className={inp} value={formData.priority || 'standard'} onChange={e => updateField('priority', e.target.value)}>
                        <option value="high" className="bg-[#070b13]">🔴 High</option>
                        <option value="medium" className="bg-[#070b13]">🟡 Medium</option>
                        <option value="standard" className="bg-[#070b13]">🔵 Standard</option>
                        <option value="low" className="bg-[#070b13]">⚪ Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Add Vehicle ─── */}
              {activeType === 'Add Vehicle' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Fleet ID (auto-gen if blank)</label>
                      <input className={inp} placeholder="e.g. FLT-A001" value={formData.fleet_id || ''} onChange={e => updateField('fleet_id', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Vehicle Type</label>
                      <select className={inp} value={formData.vehicle_type || 'Truck'} onChange={e => updateField('vehicle_type', e.target.value)}>
                        {['Truck', 'Van', 'Pickup', 'Semi-Trailer', 'Refrigerated Truck'].map(v => (
                          <option key={v} className="bg-[#070b13]">{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Driver Name</label>
                      <input className={inp} placeholder="e.g. John Doe" value={formData.driver_name || ''} onChange={e => updateField('driver_name', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Capacity (kg)</label>
                      <input type="number" min="100" step="100" className={inp} value={formData.vehicle_capacity || 5000} onChange={e => updateField('vehicle_capacity', parseFloat(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Primary Route</label>
                      <select className={inp} value={formData.route || 'Domestic'} onChange={e => updateField('route', e.target.value)}>
                        <option className="bg-[#070b13]">Domestic</option>
                        <option className="bg-[#070b13]">International</option>
                        <option className="bg-[#070b13]">Regional</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Home Warehouse</label>
                      <input className={inp} placeholder="Main Warehouse" value={formData.stop_warehouse_name || ''} onChange={e => updateField('stop_warehouse_name', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Priority</label>
                    <select className={inp} value={formData.priority || 'standard'} onChange={e => updateField('priority', e.target.value)}>
                      <option value="high" className="bg-[#070b13]">🔴 High</option>
                      <option value="medium" className="bg-[#070b13]">🟡 Medium</option>
                      <option value="standard" className="bg-[#070b13]">🔵 Standard</option>
                      <option value="low" className="bg-[#070b13]">⚪ Low</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Description (all types) */}
              <div>
                <label className={lbl}>Rationale / Notes <span className="text-red-400">*</span></label>
                <textarea
                  required
                  className={`${inp} min-h-[75px] resize-none`}
                  placeholder="Explain why this request is needed..."
                  value={formData.description || ''}
                  onChange={e => updateField('description', e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full h-10 mt-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-600/10 flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={12} />
                    <span>Dispatch Request to {managerTab}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Request History ── */}
        <div className="lg:col-span-7 space-y-4">

          {/* Controls */}
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:flex-1">
                <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder={`Search ${managerTab} requests...`}
                  className="w-full h-9 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-0.5 bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0">
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setFilter(s); setSelectedIds([]); }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      filter === s ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {selectedIds.length > 0 && filter === 'pending' && (
              <div className="flex items-center justify-between bg-cyan-950/80 border border-cyan-500/30 rounded-xl px-4 py-2.5 animate-in slide-in-from-top-1">
                <span className="text-xs font-bold text-white">{selectedIds.length} selected</span>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedIds([])} className="px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-400 hover:text-white">Cancel</button>
                  <button onClick={() => handleBulkAction('reject')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-red-500/25 text-red-400 hover:bg-red-500/10">Reject</button>
                  <button onClick={() => handleBulkAction('approve')} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase rounded-lg">Approve</button>
                </div>
              </div>
            )}
          </div>

          {/* Request Cards */}
          <div className="space-y-2">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
            ) : managerRequests.length === 0 ? (
              <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={22} className="text-cyan-400" />
                </div>
                <p className="text-xs font-bold uppercase text-slate-400">No requests found</p>
                <p className="text-[10px] text-slate-600 mt-1">Dispatch a request using the form to get started</p>
              </div>
            ) : (
              <>
                {filter === 'pending' && (
                  <div
                    onClick={() => {
                      const pendingIds = managerRequests.filter(r => r.status === 'pending').map(r => r.id);
                      setSelectedIds(prev => prev.length === pendingIds.length ? [] : pendingIds);
                    }}
                    className="flex items-center gap-2 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer select-none hover:text-white"
                  >
                    {selectedIds.length === managerRequests.filter(r => r.status === 'pending').length ? (
                      <CheckSquare size={12} className="text-cyan-400" />
                    ) : <Square size={12} />}
                    Select All Pending ({managerRequests.filter(r => r.status === 'pending').length})
                  </div>
                )}

                {managerRequests.map(req => {
                  const isSelected = selectedIds.includes(req.id);
                  const isExpanded = expandedId === req.id;
                  return (
                    <div
                      key={req.id}
                      className={`bg-white/[0.02] border rounded-xl overflow-hidden hover:border-white/15 transition-all ${
                        req.status === 'approved' ? 'border-emerald-500/10 opacity-75' :
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
                            onClick={e => { e.stopPropagation(); setSelectedIds(prev => prev.includes(req.id) ? prev.filter(x => x !== req.id) : [...prev, req.id]); }}
                            className="shrink-0 p-0.5"
                          >
                            {isSelected ? <CheckSquare size={14} className="text-cyan-400" /> : <Square size={14} className="text-slate-600" />}
                          </div>
                        )}

                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-xl shrink-0 bg-white/5 w-9 h-9 rounded-lg flex items-center justify-center border border-white/5">
                            {TYPE_ICONS[req.type] || '📋'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-bold text-slate-500">#{req.id}</span>
                              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase tracking-wide">{req.type}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${PRIORITY_STYLES[req.priority] || PRIORITY_STYLES.standard}`}>
                                {req.priority}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-white leading-relaxed truncate">{req.description}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">
                              {req.created_at ? new Date(req.created_at).toLocaleString() : '—'} ·{' '}
                              <span className={req.status === 'approved' ? 'text-emerald-400 font-bold' : req.status === 'rejected' ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                                {req.status}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {req.status === 'pending' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={e => { e.stopPropagation(); handleAction(req.id, 'reject'); }}
                                disabled={actionLoadingId === req.id}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); handleAction(req.id, 'approve'); }}
                                disabled={actionLoadingId === req.id}
                                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase rounded-lg transition-colors disabled:opacity-50"
                              >
                                {actionLoadingId === req.id ? '...' : 'Approve'}
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border ${
                              req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {req.status === 'approved' ? 'Authorized' : 'Rejected'}
                            </span>
                          )}
                          {isExpanded ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-white/[0.005]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                              <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Request Payload</h4>
                              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-[11px] space-y-1 font-mono text-slate-300 max-h-52 overflow-y-auto">
                                {req.payload && Object.entries(req.payload)
                                  .filter(([, v]) => v !== null && v !== undefined && v !== '')
                                  .map(([k, v]) => (
                                    <div key={k}>
                                      <span className="text-slate-500">{k.replace(/_/g, ' ').toUpperCase()}: </span>
                                      <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Action Preview</h4>
                              <div className="bg-cyan-950/20 border border-cyan-500/10 rounded-lg p-3 text-[11px] text-slate-400 leading-relaxed">
                                {req.type === 'Add Product' && `This will add a new product "${req.payload?.product_name}" to the WM product catalog with SKU "${req.payload?.sku || 'auto'}".`}
                                {req.type === 'Add Rack' && `This will create rack "${req.payload?.rack_name}" in the warehouse with ${req.payload?.rack_rows} rows, Zone: ${req.payload?.rack_zone}.`}
                                {req.type === 'Restock Request' && `This will add ${req.payload?.qty} units of "${req.payload?.product_name}" to warehouse inventory.`}
                                {req.type === 'Production Run' && `This will create a new production job for "${req.payload?.product_name}" — ${req.payload?.target_output} units in ${req.payload?.department} (${req.payload?.shift}).`}
                                {req.type === 'Transfer Request' && `This will dispatch a shipment of ${req.payload?.ship_qty} units (SKU: ${req.payload?.sku}) via ${req.payload?.route} route.`}
                                {req.type === 'Add Vehicle' && `This will add a ${req.payload?.vehicle_type} (Fleet ID: ${req.payload?.fleet_id || 'auto'}) with ${req.payload?.vehicle_capacity}kg capacity to the LM fleet.`}
                                {req.type === 'Supplier Request' && `This will onboard supplier "${req.payload?.supplier_name}" (${req.payload?.category}) with lead time of ${req.payload?.lead_time_days} days.`}
                                {!['Add Product','Add Rack','Restock Request','Production Run','Transfer Request','Add Vehicle','Supplier Request'].includes(req.type) && 'Action will be executed upon approval by the assigned sub-manager.'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
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
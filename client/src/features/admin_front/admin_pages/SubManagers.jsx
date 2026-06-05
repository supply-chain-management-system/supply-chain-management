import React, { useState, useEffect } from 'react';
import { 
  Factory, 
  Box, 
  Truck, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Loader2, 
  User, 
  Clock, 
  MapPin, 
  Compass, 
  Tag, 
  Mail, 
  Phone,
  Building,
  X,
  PlusCircle,
  Briefcase
} from 'lucide-react';
import api from '../../../api/api';

const TABS = {
  FACTORY: 'factory',
  WAREHOUSE: 'warehouse',
  LOGISTICS: 'logistics',
  SUPPLY: 'supply'
};

function SubManagersPage() {
  const [activeTab, setActiveTab] = useState(TABS.FACTORY);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & States
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Unified form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    shift: 'Day',
    
    // FM & WHM & Supply
    department: 'Assembly',
    
    // WHM specific
    zone: 'General Storage',
    warehouse_id: 1,

    // FM specific
    factory_id: 1,

    // LM specific
    route: 'Local',
    hub_id: 1,

    // SM specific
    category: 'Electronics',
    region: 'Domestic',
    supplier_id: '',

    // Global scoping & design
    business_id: 1,
    business_card_id: '',
    size: 'Standard',
    tagline: '',
    description: '',
    color: '#185FA5'
  });

  useEffect(() => {
    fetchManagers();
  }, [activeTab]);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      let endpoint = '';
      if (activeTab === TABS.FACTORY) endpoint = '/admin/factory-managers';
      else if (activeTab === TABS.WAREHOUSE) endpoint = '/admin/warehouse-managers';
      else if (activeTab === TABS.LOGISTICS) endpoint = '/admin/logistics-managers';
      else if (activeTab === TABS.SUPPLY) endpoint = '/admin/supply-managers';

      const res = await api.get(`${endpoint}?size=100`);
      setManagers(res.data.items || []);
    } catch (err) {
      console.error(`Failed to fetch managers for ${activeTab}:`, err);
      setError(`Failed to retrieve managers list. Ensure database schemas are fully migrated.`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedId(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      shift: 'Day',
      department: activeTab === TABS.SUPPLY ? 'Procurement' : 'Assembly',
      zone: 'General Storage',
      warehouse_id: 1,
      factory_id: 1,
      route: 'Local',
      hub_id: 1,
      category: 'Electronics',
      region: 'Domestic',
      supplier_id: '',
      business_id: 1,
      business_card_id: '',
      size: 'Standard',
      tagline: '',
      description: '',
      color: '#185FA5'
    });
    setEditorOpen(true);
  };

  const handleOpenEdit = (mgr) => {
    setSelectedId(mgr.id);
    setForm({
      name: mgr.name || '',
      email: mgr.email || '',
      phone: mgr.phone || '',
      shift: mgr.shift || 'Day',
      department: mgr.department || 'Assembly',
      zone: mgr.zone || 'General Storage',
      warehouse_id: mgr.warehouse_id || 1,
      factory_id: mgr.factory_id || 1,
      route: mgr.route || 'Local',
      hub_id: mgr.hub_id || 1,
      category: mgr.category || 'Electronics',
      region: mgr.region || 'Domestic',
      supplier_id: mgr.supplier_id || '',
      business_id: mgr.business_id || 1,
      business_card_id: mgr.business_card_id || '',
      size: mgr.size || 'Standard',
      tagline: mgr.tagline || '',
      description: mgr.description || '',
      color: mgr.color || '#185FA5'
    });
    setEditorOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      let endpoint = '';
      if (activeTab === TABS.FACTORY) endpoint = '/admin/factory-managers';
      else if (activeTab === TABS.WAREHOUSE) endpoint = '/admin/warehouse-managers';
      else if (activeTab === TABS.LOGISTICS) endpoint = '/admin/logistics-managers';
      else if (activeTab === TABS.SUPPLY) endpoint = '/admin/supply-managers';

      // Parse IDs
      const payload = { ...form };
      if (payload.warehouse_id) payload.warehouse_id = parseInt(payload.warehouse_id);
      if (payload.factory_id) payload.factory_id = parseInt(payload.factory_id);
      if (payload.hub_id) payload.hub_id = parseInt(payload.hub_id);
      if (payload.business_id) payload.business_id = parseInt(payload.business_id);
      if (payload.business_card_id) payload.business_card_id = parseInt(payload.business_card_id);
      if (payload.supplier_id) payload.supplier_id = parseInt(payload.supplier_id);
      else delete payload.supplier_id;
      if (!payload.business_card_id) delete payload.business_card_id;

      if (selectedId) {
        await api.put(`${endpoint}/${selectedId}`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      setEditorOpen(false);
      fetchManagers();
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.detail || "Validation Error. Check input fields.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      let endpoint = '';
      if (activeTab === TABS.FACTORY) endpoint = '/admin/factory-managers';
      else if (activeTab === TABS.WAREHOUSE) endpoint = '/admin/warehouse-managers';
      else if (activeTab === TABS.LOGISTICS) endpoint = '/admin/logistics-managers';
      else if (activeTab === TABS.SUPPLY) endpoint = '/admin/supply-managers';

      await api.delete(`${endpoint}/${id}`);
      setConfirmDeleteId(null);
      fetchManagers();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete card.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.department && m.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sub-Managers Registry
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
            Global management profiles across logistics, sourcing & manufacturing operations
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all duration-150"
        >
          <Plus size={14} />
          Register Manager
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 mb-6">
        <button 
          onClick={() => setActiveTab(TABS.FACTORY)}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === TABS.FACTORY ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Factory size={14} /> Factory
        </button>
        <button 
          onClick={() => setActiveTab(TABS.WAREHOUSE)}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === TABS.WAREHOUSE ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Box size={14} /> Warehouse
        </button>
        <button 
          onClick={() => setActiveTab(TABS.LOGISTICS)}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === TABS.LOGISTICS ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Truck size={14} /> Logistics
        </button>
        <button 
          onClick={() => setActiveTab(TABS.SUPPLY)}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === TABS.SUPPLY ? 'border-rose-600 text-rose-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Briefcase size={14} /> Sourcing
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative mb-6 w-full max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          placeholder="Filter by name, email or operations department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
        />
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Syncing managers catalog...</span>
        </div>
      ) : filteredManagers.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="text-slate-400" size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No managers found</h3>
          <p className="text-xs text-slate-400 mt-1">There are no operational managers registered in this category.</p>
        </div>
      ) : (
        /* Managers Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredManagers.map((mgr) => (
            <div 
              key={mgr.id}
              className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Card Banner */}
              <div 
                className="h-24 px-5 pb-3 flex flex-col justify-end text-white relative"
                style={{ background: mgr.color || '#185FA5' }}
              >
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(mgr)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(mgr.id)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500 text-white transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <span className="self-start px-2 py-0.5 rounded bg-white/20 text-[9px] font-black uppercase tracking-widest mb-1">
                  {mgr.size || 'Standard'}
                </span>
                <h3 className="text-sm font-black truncate">{mgr.name}</h3>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  {mgr.tagline && (
                    <p className="text-[11px] font-bold text-slate-400 italic">"{mgr.tagline}"</p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{mgr.email}</span>
                    </div>
                    {mgr.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{mgr.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400 shrink-0" />
                      <span>Shift: <strong>{mgr.shift || 'Day'}</strong></span>
                    </div>

                    {/* Conditional render based on Tab type */}
                    {activeTab === TABS.FACTORY && (
                      <div className="flex items-center gap-2">
                        <Factory size={12} className="text-slate-400 shrink-0" />
                        <span>Dept: <strong>{mgr.department}</strong></span>
                      </div>
                    )}
                    {activeTab === TABS.WAREHOUSE && (
                      <>
                        <div className="flex items-center gap-2">
                          <Box size={12} className="text-slate-400 shrink-0" />
                          <span>Zone: <strong>{mgr.zone}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building size={12} className="text-slate-400 shrink-0" />
                          <span>Whse ID: <strong>{mgr.warehouse_id}</strong></span>
                        </div>
                      </>
                    )}
                    {activeTab === TABS.LOGISTICS && (
                      <>
                        <div className="flex items-center gap-2">
                          <Compass size={12} className="text-slate-400 shrink-0" />
                          <span>Route: <strong>{mgr.route}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building size={12} className="text-slate-400 shrink-0" />
                          <span>Hub ID: <strong>{mgr.hub_id}</strong></span>
                        </div>
                      </>
                    )}
                    {activeTab === TABS.SUPPLY && (
                      <>
                        <div className="flex items-center gap-2">
                          <Tag size={12} className="text-slate-400 shrink-0" />
                          <span>Category: <strong>{mgr.category}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span>Region: <strong>{mgr.region}</strong></span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Footer info */}
                <div className="border-t border-slate-50 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                  <span>Scope: Container #{mgr.business_id}</span>
                  <span className={mgr.is_used ? 'text-emerald-500' : 'text-slate-400'}>
                    {mgr.is_used ? 'Bound User' : 'Pending Link'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">
                {selectedId ? 'Modify Manager Profile' : 'Register Sub-Manager'}
              </h2>
              <button 
                onClick={() => setEditorOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</label>
                  <input 
                    type="email"
                    required
                    disabled={!!selectedId}
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Phone Number</label>
                  <input 
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Working Shift</label>
                  <select 
                    value={form.shift}
                    onChange={(e) => setForm({...form, shift: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Day">Day Shift</option>
                    <option value="Night">Night Shift</option>
                    <option value="Rotational">Rotational</option>
                  </select>
                </div>

                {/* Conditional Fields based on active category */}
                {activeTab === TABS.FACTORY && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Assembly Department</label>
                      <input 
                        type="text"
                        value={form.department}
                        onChange={(e) => setForm({...form, department: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Factory Unit ID</label>
                      <input 
                        type="number"
                        value={form.factory_id}
                        onChange={(e) => setForm({...form, factory_id: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === TABS.WAREHOUSE && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Storage Zone</label>
                      <input 
                        type="text"
                        value={form.zone}
                        onChange={(e) => setForm({...form, zone: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Warehouse Facility ID</label>
                      <input 
                        type="number"
                        value={form.warehouse_id}
                        onChange={(e) => setForm({...form, warehouse_id: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === TABS.LOGISTICS && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Dispatch Route Type</label>
                      <input 
                        type="text"
                        value={form.route}
                        onChange={(e) => setForm({...form, route: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Logistics Hub ID</label>
                      <input 
                        type="number"
                        value={form.hub_id}
                        onChange={(e) => setForm({...form, hub_id: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === TABS.SUPPLY && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Sourcing Category</label>
                      <input 
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm({...form, category: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Sourcing Region</label>
                      <input 
                        type="text"
                        value={form.region}
                        onChange={(e) => setForm({...form, region: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Supplier ID (Optional)</label>
                      <input 
                        type="number"
                        value={form.supplier_id}
                        onChange={(e) => setForm({...form, supplier_id: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Card Design / Custom fields */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Container Business ID</label>
                  <input 
                    type="number"
                    value={form.business_id}
                    onChange={(e) => setForm({...form, business_id: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Business Card ID Link</label>
                  <input 
                    type="number"
                    value={form.business_card_id}
                    onChange={(e) => setForm({...form, business_card_id: e.target.value})}
                    placeholder="Auto-linked if empty"
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Card Theme Color</label>
                  <input 
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({...form, color: e.target.value})}
                    className="w-full h-10 p-1 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Card Layout Size</label>
                  <select 
                    value={form.size}
                    onChange={(e) => setForm({...form, size: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Standard">Standard Size</option>
                    <option value="Double">Double Wide</option>
                    <option value="Compact">Compact</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Slogan / Tagline</label>
                <input 
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({...form, tagline: e.target.value})}
                  placeholder="e.g. Efficiency Mastermind"
                  className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Profile Description</label>
                <textarea 
                  value={form.description}
                  rows={2}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full p-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 size={12} className="animate-spin" />}
                  Register manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-center">Confirm Purging</h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Are you sure you want to remove this manager card? The active user link will be unlinked, but user login stays active.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Abort
              </button>
              <button 
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition"
              >
                Purge Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SubManagersPage;

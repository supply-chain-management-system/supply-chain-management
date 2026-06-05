import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  ClipboardCheck, 
  Send, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  AlertTriangle, 
  Star, 
  UserPlus, 
  ChevronRight, 
  Loader2,
  Building,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  ShieldAlert,
  Inbox,
  Sparkles,
  Info,
  Plus
} from 'lucide-react';
import api from '../../../api/api';

const TABS = {
  INVENTORY: 'inventory',
  SUPPLIERS: 'suppliers',
  REQUESTS: 'requests',
  INVITES: 'invites'
};

function FactoryOversightPage() {
  const [activeTab, setActiveTab] = useState(TABS.INVENTORY);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal / Form states
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Search/Filter states
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState('');

  // Forms
  const [inventoryForm, setInventoryForm] = useState({
    sku_id: '',
    name: '',
    qty: 0,
    threshold: 10,
    warehouse_id: 1
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    category: 'Logistics',
    contact_email: '',
    phone: '',
    lead_time_days: 7,
    rating: 5.0,
    business_id: 1,
    manager_id: ''
  });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'business_manager',
    name: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, lowStockFilter, requestStatusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let endpoint = '';
      
      if (activeTab === TABS.INVENTORY) {
        endpoint = `/admin/inventory?size=100${lowStockFilter ? '&low_stock=true' : ''}`;
      } else if (activeTab === TABS.SUPPLIERS) {
        endpoint = '/admin/suppliers?size=100';
      } else if (activeTab === TABS.REQUESTS) {
        endpoint = `/admin/requests?size=100${requestStatusFilter ? `&status=${requestStatusFilter}` : ''}`;
      } else if (activeTab === TABS.INVITES) {
        endpoint = '/admin/invites?size=100';
      }

      const res = await api.get(endpoint);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Unable to synchronize supply chain data with the public and tenant schemas.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedId(null);
    setInventoryForm({ sku_id: '', name: '', qty: 0, threshold: 10, warehouse_id: 1 });
    setSupplierForm({ name: '', category: 'Logistics', contact_email: '', phone: '', lead_time_days: 7, rating: 5.0, business_id: 1, manager_id: '' });
    setInviteForm({ email: '', role: 'business_manager', name: '' });
    setEditorOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedId(item.id);
    if (activeTab === TABS.INVENTORY) {
      setInventoryForm({
        sku_id: item.sku_id || '',
        name: item.name || '',
        qty: item.qty || 0,
        threshold: item.threshold || 10,
        warehouse_id: item.warehouse_id || 1
      });
    } else if (activeTab === TABS.SUPPLIERS) {
      setSupplierForm({
        name: item.name || '',
        category: item.category || 'Logistics',
        contact_email: item.contact_email || '',
        phone: item.phone || '',
        lead_time_days: item.lead_time_days || 7,
        rating: item.rating || 5.0,
        business_id: item.business_id || 1,
        manager_id: item.manager_id || ''
      });
    }
    setEditorOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (activeTab === TABS.INVENTORY) {
        const payload = {
          ...inventoryForm,
          qty: parseInt(inventoryForm.qty),
          threshold: parseInt(inventoryForm.threshold),
          warehouse_id: parseInt(inventoryForm.warehouse_id)
        };
        if (selectedId) {
          await api.put(`/admin/inventory/${selectedId}`, payload);
        } else {
          await api.post('/admin/inventory', payload);
        }
      } else if (activeTab === TABS.SUPPLIERS) {
        const payload = {
          ...supplierForm,
          lead_time_days: parseInt(supplierForm.lead_time_days),
          rating: parseFloat(supplierForm.rating),
          business_id: parseInt(supplierForm.business_id),
          manager_id: supplierForm.manager_id ? parseInt(supplierForm.manager_id) : null
        };
        if (selectedId) {
          await api.put(`/admin/suppliers/${selectedId}`, payload);
        } else {
          await api.post('/admin/suppliers', payload);
        }
      } else if (activeTab === TABS.INVITES) {
        await api.post('/admin/invites', inviteForm);
      }
      
      setEditorOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.detail || "Action failed due to validation rules.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      let endpoint = '';
      if (activeTab === TABS.INVENTORY) endpoint = `/admin/inventory/${id}`;
      else if (activeTab === TABS.SUPPLIERS) endpoint = `/admin/suppliers/${id}`;
      else if (activeTab === TABS.REQUESTS) endpoint = `/admin/requests/${id}`;
      else if (activeTab === TABS.INVITES) endpoint = `/admin/invites/${id}`;

      await api.delete(endpoint);
      setConfirmDeleteId(null);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to revoke/delete the selected record.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/requests/${requestId}/action`, { action });
      fetchData();
    } catch (err) {
      console.error("Request action failed:", err);
      alert("Verification flow rejected this state transition.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = items.filter(i => {
    const text = searchTerm.toLowerCase();
    if (activeTab === TABS.INVENTORY) {
      const name = i.name || '';
      const sku = i.sku_id || '';
      return name.toLowerCase().includes(text) || sku.toLowerCase().includes(text);
    } else if (activeTab === TABS.SUPPLIERS) {
      const name = i.name || '';
      const cat = i.category || '';
      const email = i.contact_email || '';
      return name.toLowerCase().includes(text) || cat.toLowerCase().includes(text) || email.toLowerCase().includes(text);
    } else if (activeTab === TABS.REQUESTS) {
      const type = i.type || '';
      const msg = i.payload?.alert_message || '';
      return type.toLowerCase().includes(text) || msg.toLowerCase().includes(text);
    } else if (activeTab === TABS.INVITES) {
      const email = i.email || '';
      const role = i.role || '';
      const name = i.name || '';
      return email.toLowerCase().includes(text) || role.toLowerCase().includes(text) || name.toLowerCase().includes(text);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Factory & Supply Chain Oversight
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
            Global Stocks, Supplier SLAs, Request Pipelines & Token Dispatch
          </p>
        </div>

        {activeTab !== TABS.REQUESTS && (
          <button 
            onClick={handleOpenAdd}
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all duration-150"
          >
            {activeTab === TABS.INVITES ? <UserPlus size={14} /> : <Plus size={14} />}
            {activeTab === TABS.INVENTORY && 'Create Item'}
            {activeTab === TABS.SUPPLIERS && 'Create Supplier'}
            {activeTab === TABS.INVITES && 'Dispatch Invite'}
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 mb-6">
        <button 
          onClick={() => { setActiveTab(TABS.INVENTORY); setSearchTerm(''); }}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === TABS.INVENTORY ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package size={14} /> Inventory
        </button>
        <button 
          onClick={() => { setActiveTab(TABS.SUPPLIERS); setSearchTerm(''); }}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === TABS.SUPPLIERS ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Truck size={14} /> Suppliers
        </button>
        <button 
          onClick={() => { setActiveTab(TABS.REQUESTS); setSearchTerm(''); }}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === TABS.REQUESTS ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardCheck size={14} /> Requests & Approvals
        </button>
        <button 
          onClick={() => { setActiveTab(TABS.INVITES); setSearchTerm(''); }}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === TABS.INVITES ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserPlus size={14} /> Invite Tokens
        </button>
      </div>

      {/* Filters / Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={`Filter ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>

        {/* Tab Specific filter triggers */}
        {activeTab === TABS.INVENTORY && (
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => setLowStockFilter(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300"
            />
            Show Low Stock Alerts Only
          </label>
        )}

        {activeTab === TABS.REQUESTS && (
          <select 
            value={requestStatusFilter}
            onChange={(e) => setRequestStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Main content table/grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Syncing telemetry data...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="text-slate-400" size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No records found</h3>
          <p className="text-xs text-slate-400 mt-1">There is no operational data matching your filter parameters.</p>
        </div>
      ) : (
        /* Data Render tables based on Active Tab */
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {activeTab === TABS.INVENTORY && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">SKU ID</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Warehouse ID</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Safety Limit</th>
                    <th className="px-6 py-4">Stock Alert</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{item.sku_id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                      <td className="px-6 py-4">Depot #{item.warehouse_id}</td>
                      <td className="px-6 py-4 font-black">{item.qty} units</td>
                      <td className="px-6 py-4 text-slate-400">Min. {item.threshold}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          item.is_low_stock 
                            ? 'bg-rose-50 border-rose-150 text-rose-600 animate-pulse' 
                            : 'bg-emerald-50 border-emerald-150 text-emerald-600'
                        }`}>
                          {item.is_low_stock ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === TABS.SUPPLIERS && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Supplier Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Contact Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Lead Time</th>
                    <th className="px-6 py-4">SLA Rating</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                  {filteredItems.map(sup => (
                    <tr key={sup.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800">{sup.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-50 border text-[9px] font-black uppercase text-slate-500">
                          {sup.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">{sup.contact_email}</td>
                      <td className="px-6 py-4 text-slate-500">{sup.phone || 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">{sup.lead_time_days} days</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-800">{sup.rating?.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(sup)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(sup.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === TABS.REQUESTS && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Req. ID</th>
                    <th className="px-6 py-4">Req. Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Date Logged</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Approve/Reject Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                  {filteredItems.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono text-slate-400">#{req.id}</td>
                      <td className="px-6 py-4 font-black uppercase text-slate-800">{req.type}</td>
                      <td className="px-6 py-4 text-slate-600">{req.payload?.alert_message || 'System Notification'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          req.payload?.priority === 'high' 
                            ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {req.payload?.priority || 'standard'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          req.status === 'APPROVED' 
                            ? 'bg-emerald-50 border-emerald-150 text-emerald-600' 
                            : req.status === 'REJECTED' 
                            ? 'bg-rose-50 border-rose-150 text-rose-600' 
                            : 'bg-amber-50 border-amber-150 text-amber-600 animate-pulse'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {(req.status || '').toLowerCase().includes('pending') ? (
                          <>
                            <button 
                              onClick={() => handleRequestAction(req.id, 'APPROVE')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-250 transition text-[10px] font-bold uppercase tracking-wider"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRequestAction(req.id, 'REJECT')}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-650 text-red-500 hover:text-white border border-red-250 transition text-[10px] font-bold uppercase tracking-wider"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setConfirmDeleteId(req.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === TABS.INVITES && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Target Role</th>
                    <th className="px-6 py-4">Token Link</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Revoke Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                  {filteredItems.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800">{inv.name}</td>
                      <td className="px-6 py-4 font-semibold">{inv.email}</td>
                      <td className="px-6 py-4 font-medium text-slate-500 uppercase">{inv.role?.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-400 max-w-xs truncate">{inv.token}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          inv.is_used 
                            ? 'bg-slate-50 border-slate-200 text-slate-400' 
                            : 'bg-purple-50 border-purple-150 text-purple-600 animate-pulse'
                        }`}>
                          {inv.is_used ? 'Registered' : 'Waiting'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setConfirmDeleteId(inv.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white rounded border border-red-100 transition text-[10px] font-bold"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Editor Modal for Inventory, Supplier, and Invites */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">
                {selectedId ? 'Modify Record' : activeTab === TABS.INVITES ? 'Dispatch Invitation Link' : 'Register Entry'}
              </h2>
              <button 
                onClick={() => setEditorOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {/* Form Category 1: Inventory */}
              {activeTab === TABS.INVENTORY && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">SKU Code</label>
                      <input 
                        type="text"
                        required
                        disabled={!!selectedId}
                        value={inventoryForm.sku_id}
                        onChange={(e) => setInventoryForm({...inventoryForm, sku_id: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Warehouse Facility ID</label>
                      <input 
                        type="number"
                        required
                        value={inventoryForm.warehouse_id}
                        onChange={(e) => setInventoryForm({...inventoryForm, warehouse_id: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Item Description Name</label>
                    <input 
                      type="text"
                      required
                      value={inventoryForm.name}
                      onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Quantity In Stock</label>
                      <input 
                        type="number"
                        required
                        value={inventoryForm.qty}
                        onChange={(e) => setInventoryForm({...inventoryForm, qty: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Alert Threshold Limit</label>
                      <input 
                        type="number"
                        required
                        value={inventoryForm.threshold}
                        onChange={(e) => setInventoryForm({...inventoryForm, threshold: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Category 2: Suppliers */}
              {activeTab === TABS.SUPPLIERS && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Supplier Name</label>
                      <input 
                        type="text"
                        required
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Operations Category</label>
                      <select 
                        value={supplierForm.category}
                        onChange={(e) => setSupplierForm({...supplierForm, category: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="Raw Materials">Raw Materials</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Logistics">Logistics Partner</option>
                        <option value="Electronics">Electronics Sourcing</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Contact Email</label>
                      <input 
                        type="email"
                        required
                        value={supplierForm.contact_email}
                        onChange={(e) => setSupplierForm({...supplierForm, contact_email: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Phone</label>
                      <input 
                        type="text"
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Average Lead Time (Days)</label>
                      <input 
                        type="number"
                        required
                        value={supplierForm.lead_time_days}
                        onChange={(e) => setSupplierForm({...supplierForm, lead_time_days: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Initial Rating</label>
                      <input 
                        type="number"
                        step="0.1"
                        required
                        min="1"
                        max="5"
                        value={supplierForm.rating}
                        onChange={(e) => setSupplierForm({...supplierForm, rating: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Container Business ID</label>
                      <input 
                        type="number"
                        required
                        value={supplierForm.business_id}
                        onChange={(e) => setSupplierForm({...supplierForm, business_id: e.target.value})}
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Sourcing Manager ID</label>
                      <input 
                        type="number"
                        value={supplierForm.manager_id}
                        onChange={(e) => setSupplierForm({...supplierForm, manager_id: e.target.value})}
                        placeholder="Optional"
                        className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Category 3: Invites */}
              {activeTab === TABS.INVITES && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Recipient Email</label>
                    <input 
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                      placeholder="manager@nexusgrid.io"
                      className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Target User Role</label>
                    <select 
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                    >
                      <option value="business_manager">Business Manager</option>
                      <option value="warehouse_manager">Warehouse Manager</option>
                      <option value="factory_manager">Factory Manager</option>
                      <option value="logistics_manager">Logistics Manager</option>
                      <option value="supply_manager">Sourcing Manager</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Recipient Name (Optional)</label>
                    <input 
                      type="text"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Submit actions */}
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
                  {activeTab === TABS.INVITES ? 'Dispatch Token' : 'Save Details'}
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
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-center">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Are you sure you want to permanently delete this record? This action is non-reversible.
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default FactoryOversightPage;

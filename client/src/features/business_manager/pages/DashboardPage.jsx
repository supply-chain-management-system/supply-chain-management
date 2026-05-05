import { useState } from 'react';
import apiClient from '../../../api/api';

// --- MOCK DATA ---
const PRODUCTS = [
  { id: 'SKU-A92', name: 'Industrial Bearing Set', category: 'Mechanical' },
  { id: 'SKU-B14', name: 'Hydraulic Pump Unit', category: 'Hydraulics' },
  { id: 'SKU-C77', name: 'Control Board v2', category: 'Electronics' },
  { id: 'SKU-D33', name: 'Steel Shaft 40mm', category: 'Raw Material' },
  { id: 'SKU-E50', name: 'Conveyor Belt Module', category: 'Assembly' },
];

const WAREHOUSES = [
  { id: 'WH-01', name: 'Central Hub — Kochi' },
  { id: 'WH-02', name: 'North Depot — Delhi' },
  { id: 'WH-03', name: 'South Storage — Chennai' },
];

const DashboardPage = () => {
  // --- INVITATION FORM STATE ---
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    role: 'Warehouse Manager'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- STOCK MOVEMENT FORM STATE ---
  const [stockForm, setStockForm] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: '',
    movement_type: 'Inbound',
    notes: ''
  });
  const [stockLoading, setStockLoading] = useState(false);
  const [stockMessage, setStockMessage] = useState(null);

  const kpis = [
    { title: 'Global Inventory Value', value: '$2.45M', trend: '+5.2%', isPositive: true, icon: '💰' },
    { title: 'On-Time Delivery', value: '94.2%', trend: '-1.1%', isPositive: false, icon: '🚚' },
    { title: 'Active Shipments', value: '128', trend: '+12', isPositive: true, icon: '📦' },
    { title: 'Pending Approvals', value: '14', trend: 'Action Needed', isAlert: true, icon: '⚠️' },
  ];

  const recentActivity = [
    { id: 1, user: 'Sarah J.', role: 'Warehouse', action: 'Logged inbound shipment: 500x SKU-A92', time: '10 mins ago', color: 'bg-blue-500' },
    { id: 2, user: 'Mike T.', role: 'Factory', action: 'Updated production: Batch #402 Complete', time: '1 hour ago', color: 'bg-green-500' },
    { id: 3, user: 'Auto-System', role: 'Logistics', action: 'Flagged delay: Shipment #8822 — Port Congestion', time: '2 hours ago', color: 'bg-orange-500' },
    { id: 4, user: 'Priya K.', role: 'Supplier', action: 'Submitted PO #3301 for approval', time: '3 hours ago', color: 'bg-violet-500' },
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleStockChange = (e) => setStockForm({ ...stockForm, [e.target.name]: e.target.value });

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    try {
      const response = await apiClient.post('/business-manager/team/invite', formData);
      setMessage({ type: 'success', text: response.data.message });
     
      setFormData({ ...formData, email: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to send invitation.' });


      console.log(error.response?.data?.detail)
    } finally {
      setLoading(false);
    }
  };

  const handleStockLog = async (e) => {
    e.preventDefault();
    setStockLoading(true); setStockMessage(null);
    try {
      // Replace with real endpoint
      await apiClient.post('/business-manager/inventory/movement', stockForm);
      setStockMessage({ type: 'success', text: 'Stock movement logged successfully.' });
      setStockForm({ product_id: '', warehouse_id: '', quantity: '', movement_type: 'Inbound', notes: '' });
    } catch (error) {
      setStockMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to log stock movement.' });
    } finally { setStockLoading(false); }
  };

  const selectedProduct = PRODUCTS.find(p => p.id === stockForm.product_id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Control Tower</h1>
          <p className="text-slate-400 text-sm mt-1">Live overview of your supply chain operations</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Export CSV
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            + New Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${kpi.isAlert ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{kpi.icon}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                kpi.isAlert ? 'bg-red-100 text-red-700' :
                kpi.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
            <p className="text-slate-500 text-xs mt-1 font-medium">{kpi.title}</p>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800">Team Activity Feed</h2>
            <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View all →</span>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${a.color}`}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">{a.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.user} · {a.role} · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Required */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-semibold text-slate-800 mb-4">Action Required</h2>
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
              <span className="text-4xl font-black text-red-600">14</span>
              <p className="text-xs text-red-500 font-semibold mt-1">Pending Approvals</p>
              <p className="text-xs text-slate-400 mt-1">3 Purchase Orders · 11 Stock Adjustments</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-2">
              <span className="text-amber-500">⚠️</span>
              <div>
                <p className="text-xs font-semibold text-amber-700">2 Shipments Delayed</p>
                <p className="text-xs text-amber-500">Ports: Kochi, Mumbai</p>
              </div>
            </div>
          </div>
          <a href="/business-manager/requests">
            <button className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
              Review All Requests →
            </button>
          </a>
        </div>
      </div>

      {/* Bottom row — two forms side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* STOCK MOVEMENT FORM */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Log Stock Movement</h2>
          <p className="text-slate-400 text-xs mb-5">Record inbound / outbound / transfer for a product</p>

          <form onSubmit={handleStockLog} className="space-y-3">
            {/* Product dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Product</label>
              <select
                name="product_id"
                value={stockForm.product_id}
                onChange={handleStockChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">— Select a Product —</option>
                {PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
              {selectedProduct && (
                <p className="text-xs text-slate-400 mt-1 ml-1">Category: {selectedProduct.category}</p>
              )}
            </div>

            {/* Warehouse dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Warehouse</label>
              <select
                name="warehouse_id"
                value={stockForm.warehouse_id}
                onChange={handleStockChange}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">— Select Warehouse —</option>
                {WAREHOUSES.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={stockForm.quantity}
                  onChange={handleStockChange}
                  required
                  min="1"
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Movement Type</label>
                <select
                  name="movement_type"
                  value={stockForm.movement_type}
                  onChange={handleStockChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option>Inbound</option>
                  <option>Outbound</option>
                  <option>Transfer</option>
                  <option>Adjustment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes (optional)</label>
              <input
                type="text"
                name="notes"
                value={stockForm.notes}
                onChange={handleStockChange}
                placeholder="e.g. Received from Supplier #4"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {stockMessage && (
              <div className={`p-3 rounded-xl text-xs font-medium ${stockMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {stockMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={stockLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {stockLoading ? 'Logging...' : 'Log Stock Movement'}
            </button>
          </form>
        </div>

        {/* INVITE FORM */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-1">Invite Team Member</h2>
          <p className="text-slate-400 text-xs mb-5">Send a role-based invitation to your business workspace</p>

          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                required
                placeholder="e.g. Nexus Logistics Corp"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assign Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="Co-Manager">Co-Manager</option>
                <option value="Warehouse Manager">Warehouse Manager</option>
                <option value="Factory Manager">Factory Manager</option>
                <option value="Logistics Team">Logistics Team</option>
              </select>
            </div>

            {/* Role description hints */}
            <div className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
              {formData.role === 'Co-Manager' && '🔑 Full read/write access. Can approve requests and manage team.'}
              {formData.role === 'Warehouse Manager' && '📦 Can log stock movements, view inventory, and manage warehouse ops.'}
              {formData.role === 'Factory Manager' && '⚙️ Can update production batches, view schedules, and log output.'}
              {formData.role === 'Logistics Team' && '🚚 Can track shipments, update delivery status, and flag delays.'}
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              {loading ? 'Generating Invite...' : '✉ Send Role Invitation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

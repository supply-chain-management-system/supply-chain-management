import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';

// --- AI COMPONENT (Muted to save tokens) ---
const AiInsights = () => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  const scanSystem = async () => {
    setLoading(true);
    setTimeout(() => {
      setInsight("System check complete (MOCKED). AI auto-scanning is currently paused to conserve rate limits.");
      setLoading(false);
    }, 1000); 
  };

  useEffect(() => { scanSystem(); }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="text-blue-500 text-lg">✦</span> Korvex AI Insights
        </h3>
        <button onClick={scanSystem} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
          Re-Scan Operations
        </button>
      </div>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-5/6"></div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
          <p className="text-sm text-slate-600 leading-relaxed italic">"{insight}"</p>
        </div>
      )}
    </div>
  );
};

// --- MAIN DASHBOARD PAGE ---
const DashboardPage = () => {
  // --- STATE ---
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  // Forms State
  const [formData, setFormData] = useState({ business_name: '', email: '', role: 'Warehouse Manager' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [stockForm, setStockForm] = useState({ product_id: '', warehouse_id: '', quantity: '', movement_type: 'Inbound', notes: '' });
  const [stockLoading, setStockLoading] = useState(false);
  const [stockMessage, setStockMessage] = useState(null);

  // --- FETCH REAL DATA ---
  const fetchDashboardData = async () => {
    try {
      // Fetch Real Approvals/Requests
      const reqRes = await apiClient.get('/business-manager/requests');
      setRequests(reqRes.data);

      // Fetch Real Inventory (for the dropdown)
      const invRes = await apiClient.get('/business-manager/inventory');
      setInventory(invRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- APPROVE/REJECT LOGIC ---
  const handleRequestAction = async (requestId, actionType) => {
    try {
      await apiClient.put(`/business-manager/requests/${requestId}/action`, { action: actionType });
      // Refresh the table immediately after action
      fetchDashboardData();
    } catch (err) {
      alert(`Error processing request: ${err.response?.data?.detail || err.message}`);
    }
  };

  // --- FORM HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleStockChange = (e) => setStockForm({ ...stockForm, [e.target.name]: e.target.value });

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    try {
      const response = await apiClient.post('/business-manager/team/invite', formData);
      setMessage({ type: 'success', text: response.data.message });
      setFormData({ business_name: '', email: '', role: 'Warehouse Manager' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to send invitation.' });
    } finally { setLoading(false); }
  };

  const handleStockLog = async (e) => {
    e.preventDefault();
    setStockLoading(true); setStockMessage(null);
    try {
      await apiClient.post('/business-manager/inventory/movement', stockForm);
      setStockMessage({ type: 'success', text: 'Stock movement logged successfully.' });
      setStockForm({ product_id: '', warehouse_id: '', quantity: '', movement_type: 'Inbound', notes: '' });
    } catch (error) {
      setStockMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to log stock movement.' });
    } finally { setStockLoading(false); }
  };

  // --- DYNAMIC KPIs ---
  const kpis = [
    { title: 'Global Inventory Value', value: 'Live Sync...', trend: 'Live', isPositive: true, icon: '💰' },
    { title: 'On-Time Delivery', value: 'Live Sync...', trend: 'Live', isPositive: true, icon: '🚚' },
    { title: 'Active Shipments', value: 'Live Sync...', trend: 'Live', isPositive: true, icon: '📦' },
    { title: 'Pending Approvals', value: requests.length, trend: 'Action Needed', isAlert: requests.length > 0, icon: '⚠️' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Korvex Control Tower</h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise Orchestration · Managed by Shiyas M</p>
        </div>
      </div>

      <AiInsights />

      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${kpi.isAlert ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{kpi.icon}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                kpi.isAlert ? 'bg-red-100 text-red-700' :
                kpi.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
              }`}>{kpi.trend}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
            <p className="text-slate-500 text-xs mt-1 font-medium">{kpi.title}</p>
          </div>
        ))}
      </div>

      {/* Real Database Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="font-bold text-slate-800">Pending System Requests</h2>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase">Live Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Requester</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{req.type}</td>
                  <td className="px-6 py-4 text-slate-600">{req.description}</td>
                  <td className="px-6 py-4 text-slate-500">{req.requester_name} <span className="text-xs text-slate-400 border border-slate-200 px-1 py-0.5 rounded ml-1">{req.role}</span></td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleRequestAction(req.id, 'APPROVE')} className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">APPROVE</button>
                    <button onClick={() => handleRequestAction(req.id, 'REJECT')} className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">REJECT</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">No pending requests found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STOCK MOVEMENT FORM */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-1 text-sm">Log Stock Movement</h2>
          {stockMessage && <p className={`text-xs p-2 rounded mb-2 ${stockMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{stockMessage.text}</p>}
          <form onSubmit={handleStockLog} className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product</label>
                <select name="product_id" value={stockForm.product_id} onChange={handleStockChange} required className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select...</option>
                  {inventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                {/* Note: Replaced dummy warehouse list with a text input to accept real Warehouse IDs until a /warehouses route is built */}
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Warehouse ID</label>
                <input type="text" name="warehouse_id" value={stockForm.warehouse_id} onChange={handleStockChange} required className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. WH-01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quantity</label>
                <input type="number" name="quantity" value={stockForm.quantity} onChange={handleStockChange} required className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Type</label>
                <select name="movement_type" value={stockForm.movement_type} onChange={handleStockChange} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Inbound</option><option>Outbound</option><option>Transfer</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={stockLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl mt-2">{stockLoading ? 'LOGGING...' : 'UPDATE INVENTORY'}</button>
          </form>
        </div>

        {/* INVITE FORM (Updated with business_name) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-1 text-sm">Team Orchestration</h2>
          {message && <p className={`text-xs p-2 rounded mb-2 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</p>}
          <form onSubmit={handleInvite} className="space-y-3 mt-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Business Name</label>
              <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} required className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="Korvex Corp" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="colleague@domain.com" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Access Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900">
                  <option value="Warehouse Manager">Warehouse Manager</option>
                  <option value="Factory Manager">Factory Manager</option>
                  <option value="Logistics Team">Logistics Team</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl mt-2">{loading ? 'SENDING...' : 'DISPATCH INVITATION'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
import { useState } from 'react';
import apiClient from '../../../api/api';

const DashboardPage = () => {
  // --- INVITATION FORM STATE ---
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    role: 'Warehouse Manager'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- MOCK KPI DATA (To be replaced by Path B / Backend later) ---
  const kpis = [
    { title: "Global Inventory Value", value: "$2.45M", trend: "+5.2%", isPositive: true },
    { title: "On-Time Delivery", value: "94.2%", trend: "-1.1%", isPositive: false },
    { title: "Active Shipments", value: "128", trend: "+12", isPositive: true },
    { title: "Pending Approvals", value: "14", trend: "Requires Action", isAlert: true }
  ];

  const recentActivity = [
    { id: 1, user: "Sarah J. (Warehouse)", action: "Logged inbound shipment: 500x SKU-A92", time: "10 mins ago" },
    { id: 2, user: "Mike T. (Factory)", action: "Updated production status: Batch #402 Complete", time: "1 hour ago" },
    { id: 3, user: "Logistics Auto-System", action: "Flagged delay: Shipment #8822 (Port Congestion)", time: "2 hours ago" },
  ];

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
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

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Business Control Tower</h1>
        <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
          Export Report (CSV)
        </button>
      </div>
      
      {/* 1. KPI CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className={`bg-white p-6 rounded-xl shadow-sm border ${kpi.isAlert ? 'border-red-200' : 'border-slate-200'}`}>
            <h3 className="text-slate-500 text-sm font-medium mb-2">{kpi.title}</h3>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-800">{kpi.value}</span>
              <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
                kpi.isAlert ? 'bg-red-100 text-red-700' : 
                kpi.isPositive ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. MIDDLE ROW: ACTIVITY & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Team Activity Feed</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-4"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals Widget Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Action Required</h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-4xl font-bold text-red-600 mb-2">14</span>
            <span className="text-sm text-slate-600 font-medium">Pending Approvals</span>
            <p className="text-xs text-slate-400 mt-2">Including 3 Purchase Orders and 11 Stock Adjustments.</p>
          </div>
          <button className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Review All Requests
          </button>
        </div>
      </div>

      {/* 3. INVITATION FORM SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Access Management</h2>
        <p className="text-slate-500 text-sm mb-6">
          Invite team members to this tenant. Access is enforced via role-based schemas.
        </p>

        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. Nexus Logistics Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="Co-Manager">Co-Manager</option>
                <option value="Warehouse Manager">Warehouse Manager</option>
                <option value="Factory Manager">Factory Manager</option>
                <option value="Logistics Team">Logistics Team</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="colleague@example.com"
            />
          </div>
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Generating Invite...' : 'Send Role Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
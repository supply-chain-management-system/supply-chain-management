import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';

// --- AI COMPONENT ---
const AiInsights = ({ pendingCount }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setInsight(pendingCount > 0 
        ? `Attention: ${pendingCount} system requests require your immediate authorization to maintain supply chain flow.`
        : "System check complete. All global inventory levels are stable."
      );
      setLoading(false);
    }, 1000);
  }, [pendingCount]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-sm">
        <span className="text-blue-500 text-lg">✦</span> Korvex AI Insights
      </h3>
      {loading ? (
        <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
      ) : (
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
          <p className="text-sm text-slate-600 italic">"{insight}"</p>
        </div>
      )}
    </div>
  );
};

// --- MAIN DASHBOARD PAGE ---
const DashboardPage = () => {
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reqRes, anaRes] = await Promise.all([
        apiClient.get('/business-manager/requests'),
        apiClient.get('/business-manager/analytics')
      ]);
      // Only show 'pending' requests in the control tower
      setRequests(reqRes.data.filter(r => r.status === 'pending'));
      setAnalytics(anaRes.data);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleRequestAction = async (requestId, actionType) => {
    try {
      await apiClient.put(`/business-manager/requests/${requestId}/action`, { action: actionType });
      fetchDashboardData();
    } catch (err) {
      alert("Action Error: " + (err.response?.data?.detail || err.message));
    }
  };

  const kpis = [
    { title: 'Inventory Value', value: analytics?.inventory_value || 'Syncing...', icon: '💰' },
    { title: 'On-Time Delivery', value: analytics?.on_time_delivery || '94%', icon: '🚚' },
    { title: 'Active Shipments', value: analytics?.active_shipments || '12', icon: '📦' },
    { title: 'Pending Actions', value: requests.length, isAlert: requests.length > 0, icon: '⚠️' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Control Tower</h1>
          <p className="text-slate-400 text-sm">Enterprise Orchestration · Managed by Shiyas M</p>
        </div>
        <button onClick={fetchDashboardData} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all">
          {loading ? 'REFRESHING...' : '🔄 SYNC SYSTEM'}
        </button>
      </div>

      <AiInsights pendingCount={requests.length} />

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${kpi.isAlert ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
            <div className="text-xl mb-3">{kpi.icon}</div>
            <p className="text-2xl font-black text-slate-800">{kpi.value}</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{kpi.title}</p>
          </div>
        ))}
      </div>

      {/* SYSTEM REQUESTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <h2 className="font-bold text-slate-800 text-sm">Priority Authorization Queue</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-4">Request</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4 text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {requests.length > 0 ? requests.map(req => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-700">#{req.id}</td>
                <td className="px-6 py-4 text-slate-600">{req.description}</td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-tighter">
                    {req.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleRequestAction(req.id, 'REJECT')} 
                    className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
                  >
                    REJECT & DELETE
                  </button>
                  <button 
                    onClick={() => handleRequestAction(req.id, 'APPROVE')} 
                    className="text-[10px] font-bold text-white bg-slate-900 hover:bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-slate-200 transition-all"
                  >
                    APPROVE & FORWARD
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">No pending authorizations required.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
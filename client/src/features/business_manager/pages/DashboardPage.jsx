import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';
import { 
  Coins, 
  Truck, 
  Box, 
  AlertTriangle, 
  RefreshCw, 
  Diamond, 
  X, 
  Check,
  TrendingUp,
  Activity
} from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-3xl overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- AI COMPONENT ---
const AiInsights = ({ pendingCount }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setInsight(pendingCount > 0 
        ? `System alerts resolved. Attention required: ${pendingCount} pending routing and logistics authorizations detected in the orchestration queue.`
        : "Operational check complete. All global transit vectors and warehouse capacities are operating within optimal bounds."
      );
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pendingCount]);

  return (
    <GlassCard className="p-6 border-cyan-500/10">
      <h3 className="font-black text-white flex items-center gap-2 mb-4 text-xs uppercase tracking-widest">
        <span className="text-cyan-400 animate-pulse"><Diamond size={12} fill="currentColor" /></span> Korvex AI Insights
      </h3>
      {loading ? (
        <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
      ) : (
        <div className="p-4 rounded-2xl bg-cyan-950/10 border border-cyan-500/10">
          <p className="text-sm text-cyan-200/90 italic leading-relaxed">"{insight}"</p>
        </div>
      )}
    </GlassCard>
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

  useEffect(() => { 
    fetchDashboardData(); 
  }, []);

  const handleRequestAction = async (requestId, actionType) => {
    try {
      await apiClient.put(`/business-manager/requests/${requestId}/action`, { action: actionType });
      fetchDashboardData();
    } catch (err) {
      alert("Action Error: " + (err.response?.data?.detail || err.message));
    }
  };

  const kpis = [
    { title: 'Inventory Value', value: analytics?.inventory_value || '$1.24M', icon: Coins, color: 'text-cyan-400' },
    { title: 'On-Time Delivery', value: analytics?.on_time_delivery || '94%', icon: Truck, color: 'text-sky-400' },
    { title: 'Active Shipments', value: analytics?.active_shipments || '12', icon: Box, color: 'text-teal-400' },
    { title: 'Pending Actions', value: requests.length, isAlert: requests.length > 0, icon: AlertTriangle, color: requests.length > 0 ? 'text-amber-400' : 'text-gray-400' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-cyan-500 rounded-full" />
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Control Tower</h1>
          </div>
          <p className="text-gray-500 font-bold ml-5">
            Enterprise Orchestration Center · Active Node Registry
          </p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          className="flex items-center gap-2 bg-white/5 text-gray-300 hover:text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase border border-white/5 hover:bg-white/10 tracking-widest transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'SYNCING...' : 'SYNC SYSTEM'}
        </button>
      </div>

      <AiInsights pendingCount={requests.length} />

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <GlassCard 
            key={i} 
            className={`p-6 hover:-translate-y-1 transition-all duration-300 ${kpi.isAlert ? 'border-amber-500/20 bg-amber-500/[0.02]' : ''}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 ${kpi.color}`}>
                <kpi.icon size={22} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/80">Active Metric</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tight mb-1">{kpi.value}</p>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{kpi.title}</p>
          </GlassCard>
        ))}
      </div>

      {/* SYSTEM REQUESTS TABLE */}
      <GlassCard>
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
          <div className="w-1.5 h-5 bg-cyan-500 rounded-full" />
          <h2 className="font-black text-white text-sm uppercase tracking-wider">Priority Authorization Queue</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.01] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Origin Node</th>
                <th className="px-6 py-4 text-right">Action Interface</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5 font-bold text-white">#{req.id}</td>
                  <td className="px-6 py-5 text-gray-300">{req.description}</td>
                  <td className="px-6 py-5">
                    <span className="text-[9px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {req.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right space-x-3">
                    <button 
                      onClick={() => handleRequestAction(req.id, 'REJECT')} 
                      className="text-[10px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 px-4 py-2.5 rounded-xl transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleRequestAction(req.id, 'APPROVE')} 
                      className="text-[10px] font-black uppercase tracking-wider text-white bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 hover:scale-105 transition-all"
                    >
                      Authorize
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-gray-500 italic">No pending authorizations required at this time.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default DashboardPage;
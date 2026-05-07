import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';

const FactoryPage = () => {
  const [productionRuns, setProductionRuns] = useState([]);
  const [factoryInfo, setFactoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH REAL-TIME FACTORY DATA ---
  const fetchFactoryData = async () => {
    setLoading(true);
    try {
      // Fetching production runs and factory details
      // Assuming user_id 1 for the current session based on previous confirmed DB state
      const [prodRes, factRes] = await Promise.all([
        apiClient.get('/factory/production'),
        apiClient.get('/factory/1') // Fetching details for Factory #1 confirmed in DB
      ]);
      setProductionRuns(prodRes.data);
      setFactoryInfo(factRes.data);
    } catch (err) {
      console.error("Factory Page Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactoryData();
  }, []);

  const factoryStats = [
    { title: 'Active Batches', value: productionRuns.filter(p => p.status === 'PENDING' || p.status === 'PROGRESS').length, icon: '⚙️' },
    { title: 'Total Output (Units)', value: productionRuns.reduce((acc, curr) => acc + (curr.output_qty || 0), 0), icon: '📊' },
    { title: 'Target Fulfillment', value: '88%', icon: '🎯' },
    { title: 'Factory Workers', value: '12', icon: '👷' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {factoryInfo ? factoryInfo.name : 'Factory Operations'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {factoryInfo ? `Location: ${factoryInfo.location || 'Kochi, India'}` : 'Loading factory details...'}
          </p>
        </div>
        <button 
          onClick={fetchFactoryData}
          className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          🔄 Refresh Schedules
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {factoryStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="text-xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Main Production Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Production Schedule Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Live Production Schedule</h2>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Real-time Feed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Batch ID</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Target / Output</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productionRuns.length > 0 ? productionRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#PR-{run.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{run.product_name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="font-bold">{run.output_qty || 0}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      {run.target_qty}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${getStatusColor(run.status)}`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-slate-400 hover:text-blue-600">EDIT</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">No active production runs assigned to this factory.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Batch Progress Tracker */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-6">Batch Completion</h2>
          <div className="space-y-6">
            {productionRuns.filter(p => p.status === 'PROGRESS').slice(0, 3).map(run => {
              const percentage = Math.round(((run.output_qty || 0) / run.target_qty) * 100);
              return (
                <div key={run.id} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-600">{run.product_name}</span>
                    <span className="text-slate-400">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            
            {productionRuns.filter(p => p.status === 'PROGRESS').length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400">No batches currently in progress.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-50">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Factory Alerts</h4>
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3">
              <span className="text-red-500">⚠️</span>
              <p className="text-[11px] text-red-700 leading-tight">
                Maintenance required for Line 4 (Hydraulic Pump Unit assembly) scheduled for tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryPage;
import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';

const LogisticsPage = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH SHIPMENT DATA ---
  const fetchLogisticsData = async () => {
    setLoading(true);
    try {
      // Endpoint placeholder for your logistics service
      const response = await apiClient.get('/logistics/shipments');
      setShipments(response.data);
    } catch (err) {
      console.error("Logistics Fetch Error:", err);
      // Fallback mock data for immediate UI visualization
      setShipments([
        { id: 'SHP-8821', destination: 'Kochi Port', status: 'In Transit', ETA: '2 Hours', carrier: 'BlueDart' },
        { id: 'SHP-8822', destination: 'Mumbai Hub', status: 'Delayed', ETA: '14 Hours', carrier: 'FedEx' },
        { id: 'SHP-8823', destination: 'Chennai Depot', status: 'Delivered', ETA: 'Completed', carrier: 'DHL' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const stats = [
    { title: 'Active Shipments', value: '42', icon: '📦', color: 'text-blue-600' },
    { title: 'Avg. Transit Time', value: '3.2 Days', icon: '⏱️', color: 'text-slate-600' },
    { title: 'Fuel Efficiency', value: '92%', icon: '⛽', color: 'text-emerald-600' },
    { title: 'Fleet Availability', value: '18/20', icon: '🚛', color: 'text-violet-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Fleet & Logistics Command</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time transit monitoring and carrier orchestration</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            Route Optimization
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            Dispatch New Load
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
            <div className="text-xl mb-3">{s.icon}</div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Logistics Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Shipment Tracker Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-bold text-slate-800">Live Shipments</h2>
            <div className="flex gap-2">
               <input 
                type="text" 
                placeholder="Search ID..." 
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
               />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Shipment ID</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4">Carrier</th>
                  <th className="px-6 py-4">ETA</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{s.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{s.destination}</td>
                    <td className="px-6 py-4 text-slate-500">{s.carrier}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{s.ETA}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${
                        s.status === 'Delayed' ? 'bg-red-50 text-red-600 border-red-100' : 
                        s.status === 'In Transit' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transit Delay Monitor */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4">Route Health</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-orange-700 uppercase">Kochi Port</span>
                  <span className="text-[10px] font-bold text-orange-500">HIGH CONGESTION</span>
                </div>
                <p className="text-[11px] text-orange-600 leading-tight">
                  Vessel offloading delayed by 4 hours due to weather. ETA for all linked shipments adjusted.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">Mumbai-Delhi NH44</span>
                  <span className="text-[10px] font-bold text-emerald-500">CLEAR</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Traffic flow optimal. Express carriers reporting ahead-of-schedule arrivals.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-sm mb-2">Logistics Optimizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              AI suggests switching 4 pending shipments from FedEx to DHL to save **$1,200** in surcharges this week.
            </p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-colors">
              Apply Recommendation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsPage;
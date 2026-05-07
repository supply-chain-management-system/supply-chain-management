import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH SUPPLIER DATA ---
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      // Endpoint placeholder for your PostgreSQL supplier table
      const response = await apiClient.get('/business-manager/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      console.error("Suppliers Data Fetch Error:", err);
      // Fallback mock data for immediate UI visualization
      setSuppliers([
        { id: 'SUP-001', name: 'GlobalTech Electronics', category: 'Electronics', rating: 4.8, lead_time: '14 Days', status: 'Preferred' },
        { id: 'SUP-002', name: 'Apex MetalWorks Inc.', category: 'Raw Material', rating: 4.2, lead_time: '21 Days', status: 'Active' },
        { id: 'SUP-003', name: 'HydraFlow Dynamics', category: 'Hydraulics', rating: 3.4, lead_time: '45 Days', status: 'Under Review' },
        { id: 'SUP-004', name: 'NextGen Polymers', category: 'Plastics', rating: 4.9, lead_time: '7 Days', status: 'Preferred' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const stats = [
    { title: 'Total Suppliers', value: suppliers.length, icon: '🏢', color: 'text-blue-600' },
    { title: 'Avg Quality Rating', value: '4.3/5.0', icon: '⭐', color: 'text-yellow-500' },
    { title: 'Avg Lead Time', value: '21 Days', icon: '⏱️', color: 'text-slate-600' },
    { title: 'Suppliers at Risk', value: suppliers.filter(s => s.status === 'Under Review').length, icon: '⚠️', color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Supplier Directory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage vendor relationships, lead times, and performance</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchSuppliers}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Sync Database
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
            + Onboard Supplier
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${s.title === 'Suppliers at Risk' && s.value > 0 ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
            <div className={`text-xl mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{s.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Supplier Directory Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="font-bold text-slate-800">Active Vendor Network</h2>
            <div className="flex gap-2">
               <input 
                type="text" 
                placeholder="Search vendors..." 
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
               />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Supplier Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Lead Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{s.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{s.id}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{s.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="font-bold text-slate-700">{s.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{s.lead_time}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${
                        s.status === 'Preferred' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        s.status === 'Under Review' ? 'bg-red-50 text-red-600 border-red-100' : 
                        'bg-blue-50 text-blue-600 border-blue-100'
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

        {/* Risk Management & Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 mb-4">Vendor Risk Alerts</h2>
            <div className="space-y-4">
              
              {/* Alert Card */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-red-700 uppercase">HydraFlow Dynamics</span>
                  <span className="text-[10px] font-bold text-red-500">CRITICAL</span>
                </div>
                <p className="text-[11px] text-red-600 leading-tight">
                  Lead time has increased by 15 days over the last quarter. Quality rating dropped below 3.5. AI recommends finding an alternative supplier for Hydraulics.
                </p>
                <button className="mt-3 text-[10px] font-bold text-red-700 hover:underline uppercase tracking-wider">
                  Review Contract →
                </button>
              </div>

              {/* Alert Card */}
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-orange-700 uppercase">GlobalTech Electronics</span>
                  <span className="text-[10px] font-bold text-orange-500">WARNING</span>
                </div>
                <p className="text-[11px] text-orange-600 leading-tight">
                  Component shortage reported in Southeast Asia facilities. Expect potential 5-day delays on Control Board v2 deliveries next month.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-sm mb-2">Copilot Sourcing Suggestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Based on your drafted Production Order for 250 Solar Panels, you will need **Lithium Cells**. Should I draft an RFQ (Request For Quote) to our top 3 electronic suppliers?
            </p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-colors">
              Draft RFQs Automatically
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersPage;
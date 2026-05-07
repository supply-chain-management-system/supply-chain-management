import { useState, useEffect } from 'react';
import apiClient from '../../../api/api';

const WarehousePage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH INVENTORY DATA ---
  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Fetching real inventory items from your PostgreSQL database
      const response = await apiClient.get('/business-manager/inventory');
      setInventory(response.data);
    } catch (err) {
      console.error("Warehouse Data Fetch Error:", err);
      // Fallback mock data for UI testing if table is empty
      setInventory([
        { id: 1, name: 'Industrial Bearing Set', sku_id: 'SKU-A92', qty: 450, threshold: 100, status: 'Healthy' },
        { id: 2, name: 'Lithium Cells', sku_id: 'SKU-TEST-01', qty: 5, threshold: 50, status: 'Low Stock' },
        { id: 3, name: 'Control Board v2', sku_id: 'SKU-C77', qty: 88, threshold: 20, status: 'Healthy' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const warehouseStats = [
    { title: 'Total SKUs', value: inventory.length, icon: '🏷️' },
    { title: 'Low Stock Alerts', value: inventory.filter(i => i.qty < i.threshold).length, icon: '⚠️' },
    { title: 'Storage Capacity', value: '78%', icon: '🏢' },
    { title: 'Incoming Shipments', value: '3', icon: '📥' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">Central Hub — Kochi (WH-01)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchInventory}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Sync Stock
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            + Add New SKU
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouseStats.map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border ${stat.title === 'Low Stock Alerts' && stat.value > 0 ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
            <div className="text-xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Inventory Management Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="font-bold text-slate-800">Stock Levels & Reorder Points</h2>
          <div className="flex gap-4">
            <select className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-white">
              <option>All Categories</option>
              <option>Mechanical</option>
              <option>Electronics</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">SKU ID</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Reorder Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => {
                const isLow = item.qty < item.threshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.sku_id}</td>
                    <td className={`px-6 py-4 font-bold ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.threshold}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase ${
                        isLow ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {isLow ? 'Critically Low' : 'Adequate'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-blue-600 hover:underline">Adjust</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarehousePage;
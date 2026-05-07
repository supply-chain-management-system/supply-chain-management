import React, { useEffect, useState } from "react";
import { 
  Package, 
  Layers, 
  Database, 
  AlertTriangle, 
  ArrowUpRight, 
  Boxes,
  ClipboardList
} from "lucide-react";
import api from "../../api/api";

function WarehouseDashboard() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [racks, setRacks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const inv = await api.get("/inventory");
      const prod = await api.get("/ware_products");
      const rack = await api.get("/racks");

      setInventory(inv.data);
      setProducts(prod.data);
      setRacks(rack.data);
    } catch (err) {
      console.log(err);
    }
  };

  const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockItems = inventory.filter((i) => i.quantity < 20);

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Warehouse Dashboard
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Database size={14} /> System status: Optimal
            </p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white border border-slate-200 px-4 py-2 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
               Export CSV
             </button>
             <button className="bg-indigo-600 px-4 py-2 rounded-md text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm">
               New Inventory
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Products" 
            value={products.length} 
            icon={<Package className="text-blue-600" />} 
            trend="+12%" 
          />
          <StatCard 
            title="Active Racks" 
            value={racks.length} 
            icon={<Layers className="text-purple-600" />} 
            trend="Stable"
          />
          <StatCard 
            title="Total Stock" 
            value={totalStock.toLocaleString()} 
            icon={<Boxes className="text-emerald-600" />} 
            trend="+5.4%" 
          />
          <StatCard 
            title="Low Stock" 
            value={lowStockItems.length} 
            icon={<AlertTriangle className="text-rose-600" />} 
            isAlert={lowStockItems.length > 0}
            trend={lowStockItems.length > 5 ? "Critical" : "Warning"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={20} className="text-indigo-500" />
                  Inventory Overview
                </h2>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Live Data</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Ref</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Storage Location</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          PRD-{item.product_id}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            Rack {item.rack_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-bold ${item.quantity < 20 ? "text-rose-600" : "text-slate-600"}`}>
                            {item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 text-rose-600">
                <AlertTriangle size={20} />
                Critical Alerts
              </h2>

              <div className="space-y-3">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm italic font-medium">All stock levels normal</p>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex flex-col p-4 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-700">LOW STOCK</span>
                        <ArrowUpRight size={14} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-slate-700 mt-1">
                        Product <span className="font-bold">#{item.product_id}</span> needs restock.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-rose-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500" 
                            style={{ width: `${(item.quantity / 20) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-rose-600">{item.quantity} / 20</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, trend, isAlert }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
        {icon}
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
        isAlert ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
      }`}>
        {trend}
      </span>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className={`text-2xl font-black mt-1 ${isAlert ? "text-rose-600" : "text-slate-800"}`}>
        {value}
      </h3>
    </div>
  </div>
);

export default WarehouseDashboard;
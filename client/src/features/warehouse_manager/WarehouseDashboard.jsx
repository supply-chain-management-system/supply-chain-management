import React, { useEffect, useState } from "react";
import {
  Package,
  Layers,
  Database,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  ClipboardList,
} from "lucide-react";

import api from "../../api/api";

function WarehouseDashboard() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [racks, setRacks] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // Added
  const [factories, setFactories] = useState([]);   // Added

  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [selectedReceiverId, setSelectedReceiverId] = useState("");
  const [requestQuantity, setRequestQuantity] = useState(50);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {

  Promise.all([
    api.get("/inventory"),
    api.get("/ware_products"),
    api.get("/racks"),
    api.get("/ware_house"),
    api.get("/Factory_deatils")
  ])

  .then(([inv, prod, rack, wh, fac]) => {

    setInventory(inv.data);
    console.log(inv.data)

    setProducts(prod.data);

    setRacks(rack.data);

    setWarehouses(wh.data);

    setFactories(fac.data);

    const criticalItem = inv.data.find(
      (item) => item.quantity < 5
    );

    if (criticalItem) {
      setSelectedItem(criticalItem);

      setShowPopup(true);
    }
  })

  .catch((err) => {
    console.log("Error fetching data:", err);
  });
};

  const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockItems = inventory.filter((i) => i.quantity < 20);

  const getProductName = (id) => products.find((p) => p.id === id)?.name || "Unknown";
  const getRackName = (id) => racks.find((r) => r.id === id)?.name || "Unknown";

  const sendRequest = async () => {
    if (!selectedReceiverId) return alert("Please select a destination factory");

    try {
      await api.post("/request", {
        product_id: selectedItem.product_id,
        sender_type: "warehouse",
        sender_id: warehouses[0]?.id || 1, 
        receiver_type: "factory",
        receiver_id: parseInt(selectedReceiverId),
        quantity: requestQuantity,
        status: "pending"
      });

      alert("Request Sent Successfully");
      setShowPopup(false);
      setSelectedReceiverId("");
    } catch (err) {
      console.error(err);
      alert("Failed to send request. Check console.");
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Warehouse Dashboard</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Database size={14} /> System status: Optimal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Products" value={products.length} icon={<Package className="text-blue-600" />} trend="+12%" />
          <StatCard title="Active Racks" value={racks.length} icon={<Layers className="text-purple-600" />} trend="Stable" />
          <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={<Boxes className="text-emerald-600" />} trend="+5.4%" />
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
                  <ClipboardList size={20} className="text-indigo-500" /> Inventory Overview
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rack</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{getProductName(item.product_id)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {getRackName(item.rack_id)}
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
                <AlertTriangle size={20} /> Critical Alerts
              </h2>
              <div className="space-y-3">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm italic font-medium">All stock levels normal</p>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item.id} className="group flex flex-col p-4 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-700">LOW STOCK</span>
                        <ArrowUpRight size={14} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-slate-700 mt-1">
                        Product <span className="font-bold">{getProductName(item.product_id)}</span> needs restock.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowPopup(true);
                        }}
                        className="mt-4 bg-indigo-600 text-white text-xs font-semibold py-2 rounded-md hover:bg-indigo-700"
                      >
                        Request Stock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPopup && selectedItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase">Restock Required</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Send Material Request</h2>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold">Item Details</p>
                <p className="font-semibold text-slate-800">{getProductName(selectedItem.product_id)}</p>
                <p className="text-sm text-rose-600">Current Level: {selectedItem.quantity} units</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Target Factory</label>
                <select 
                  value={selectedReceiverId}
                  onChange={(e) => setSelectedReceiverId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- Choose a Factory --</option>
                  {factories.map(fac => (
                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Request Quantity</label>
                <input 
                  type="number"
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowPopup(false)} className="flex-1 border border-slate-300 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-50">
                Ignore
              </button>
              <button 
                onClick={sendRequest} 
                disabled={!selectedReceiverId}
                className={`flex-1 py-2.5 rounded-lg font-bold text-white shadow-md ${!selectedReceiverId ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ title, value, icon, trend, isAlert }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">{icon}</div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${isAlert ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
        {trend}
      </span>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className={`text-2xl font-black mt-1 ${isAlert ? "text-rose-600" : "text-slate-800"}`}>{value}</h3>
    </div>
  </div>
);

export default WarehouseDashboard;
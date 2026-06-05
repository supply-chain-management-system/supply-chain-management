import React, { useEffect, useState } from "react";
import {
  Package,
  Layers,
  Database,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  ClipboardList,
  MessageSquare

} from "lucide-react";

import api from "../../api/api";
import KorvexCopilot from "../KorvexCopilot";
function WarehouseDashboard() {
  // Core Dashboard Data States
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [racks, setRacks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [factories, setFactories] = useState([]);
  const [requests, setRequests] = useState([]);

  // Popup & Stock Request Modal States
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState("");
  const [requestQuantity, setRequestQuantity] = useState(50);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Component Lifecycle
  useEffect(() => {
    fetchData();
  }, []);

  // Core Data Retrieval Method
  const fetchData = () => {
    Promise.all([
      api.get("/inventory"),
      api.get("/ware_products"),
      api.get("/racks"),
      api.get("/ware_house"),
      api.get("/Factory_deatils"),
      api.get("/request")
    ])
      .then(([inv, prod, rack, wh, fac, reqs]) => {
        setInventory(inv.data);
        setProducts(prod.data);
        setRacks(rack.data);
        setWarehouses(wh.data);
        setFactories(fac.data);
        setRequests(reqs.data);

        const criticalItem = inv.data.find((item) => item.quantity < 5);

        if (criticalItem) {
          setSelectedItem(criticalItem);
          setShowPopup(true);
        }
      })
      .catch((err) => {
        console.log("Error fetching data:", err);
      });
  };

  const totalStock = inventory.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  const lowStockItems = inventory.filter((i) => i.quantity < 20);

  const getProductName = (id) =>
    products.find((p) => p.id === id)?.name || "Unknown";

  const getRackName = (id) =>
    racks.find((r) => r.id === id)?.name || "Unknown";

  const getFactoryName = (id) =>
    factories.find((f) => f.id === id)?.name || `Factory #${id}`;

  const handleApproveRequest = async (reqId) => {
    try {
      await api.patch(`/request/${reqId}/status?request_status=approved`);
      alert("Material Transfer Approved & Dispatched!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to approve request.");
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      await api.patch(`/request/${reqId}/status?request_status=rejected`);
      alert("Material Request Rejected");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to reject request.");
    }
  };

  const sendRequest = async () => {
    if (!selectedReceiverId)
      return alert("Please select a destination factory");

    try {
      await api.post("/request", {
        product_id: selectedItem.product_id,
        sender_type: "warehouse",
        sender_id: warehouses[0]?.id || 1,
        receiver_type: "factory",
        receiver_id: parseInt(selectedReceiverId),
        quantity: requestQuantity,
        status: "pending",
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
    <div className="bg-stone-950 min-h-screen p-4 md:p-8 relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-7 rounded-full" style={{ background: 'linear-gradient(180deg, #b87333, #8b5a2b)' }} />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Warehouse Dashboard</h1>
            </div>
            <p className="text-stone-500 mt-1 flex items-center gap-2 ml-4 text-sm">
              <Database size={14} /> System status: Optimal
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Products" value={products.length} icon={<Package style={{ color: '#b87333' }} />} trend="+12%" />
          <StatCard title="Active Racks" value={racks.length} icon={<Layers style={{ color: '#d4956a' }} />} trend="Stable" />
          <StatCard title="Total Stock" value={totalStock.toLocaleString()} icon={<Boxes className="text-emerald-400" />} trend="+5.4%" />
          <StatCard 
            title="Low Stock" 
            value={lowStockItems.length} 
            icon={<AlertTriangle className="text-rose-400" />} 
            isAlert={lowStockItems.length > 0} 
            trend={lowStockItems.length > 5 ? "Critical" : "Warning"} 
          />
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory Table */}
          <div className="lg:col-span-2">
            <div className="bg-stone-900 rounded-xl shadow-sm border border-amber-900/20 overflow-hidden">
              <div className="p-6 border-b border-amber-900/20 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList size={20} style={{ color: '#b87333' }} /> Inventory Overview
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-950 border-b border-amber-900/20">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Rack</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/10">
                    {inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-amber-900/10 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-stone-200">{getProductName(item.product_id)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900/20 border border-amber-900/30" style={{ color: '#d4956a' }}>
                            {getRackName(item.rack_id)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-bold ${item.quantity < 20 ? "text-rose-400" : "text-stone-300"}`}>
                            {item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Incoming Material Requests Card */}
            <div className="bg-stone-900 rounded-xl shadow-sm border border-amber-900/20 overflow-hidden mt-8">
              <div className="p-6 border-b border-amber-900/20 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ArrowUpRight size={20} style={{ color: '#b87333' }} /> Incoming Material Requests
                </h2>
              </div>
              <div className="overflow-x-auto">
                {requests.filter(r => r.sender_type === "factory").length === 0 ? (
                  <div className="text-center py-12 text-stone-500">
                    <p className="text-sm font-medium italic">No factory material requests found</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-stone-950 border-b border-amber-900/20">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Request ID</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Material Name</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Requested By</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-right">Quantity</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center">Status</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-stone-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-900/10">
                      {requests.filter(r => r.sender_type === "factory").map((req) => (
                        <tr key={req.id} className="hover:bg-amber-900/10 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-stone-500">#{req.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-stone-200">{getProductName(req.product_id)}</td>
                          <td className="px-6 py-4 text-sm text-stone-400">{getFactoryName(req.sender_id)}</td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-stone-300">{req.quantity}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              req.status === "approved"
                                ? "bg-emerald-950/50 text-emerald-400 border-emerald-900/50"
                                : req.status === "rejected"
                                ? "bg-rose-950/50 text-rose-400 border-rose-900/50"
                                : "bg-amber-950/50 border-amber-900/50"
                            }`} style={req.status === 'pending' ? { color: '#d4956a' } : {}}>
                              {req.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            {req.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveRequest(req.id)}
                                  className="text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm transition-all"
                                  style={{ background: 'linear-gradient(135deg, #b87333, #8b5a2b)' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(req.id)}
                                  className="border border-rose-800 text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-rose-950/50 transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-6">
            <div className="bg-stone-900 rounded-xl shadow-sm border border-amber-900/20 p-6">
              <h2 className="text-lg font-bold text-rose-400 mb-6 flex items-center gap-2">
                <AlertTriangle size={20} /> Critical Alerts
              </h2>

              <div className="space-y-3">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-stone-500 text-sm italic font-medium">All stock levels normal</p>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <div key={item.id} className="group flex flex-col p-4 bg-rose-950/20 border border-rose-900/30 rounded-lg hover:bg-rose-950/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-400">LOW STOCK</span>
                        <ArrowUpRight size={14} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-stone-300 mt-1">
                        Product <span className="font-bold">{getProductName(item.product_id)}</span> needs restock.
                      </p>

                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowPopup(true);
                        }}
                        className="mt-4 text-white text-xs font-semibold py-2 rounded-md transition-all"
                        style={{ background: 'linear-gradient(135deg, #b87333, #8b5a2b)' }}
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

      {/* Popup Dialog */}
      {showPopup && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 w-full max-w-md rounded-xl p-6 shadow-2xl border border-amber-900/30">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase">
                Restock Required
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-4">Send Material Request</h2>

            <div className="space-y-4">
              <div className="p-3 bg-stone-950 rounded-lg border border-amber-900/20">
                <p className="text-xs text-stone-500 uppercase font-bold">Item Details</p>
                <p className="font-semibold text-white">{getProductName(selectedItem.product_id)}</p>
                <p className="text-sm text-rose-400">Current Level: {selectedItem.quantity} units</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-300 mb-1">Select Target Factory</label>
                <select 
                  value={selectedReceiverId}
                  onChange={(e) => setSelectedReceiverId(e.target.value)}
                  className="w-full p-2.5 bg-stone-950 border border-amber-900/30 rounded-lg text-sm text-white outline-none focus:ring-2 focus:border-amber-600"
                  style={{ '--ring-color': '#b87333' }}
                >
                  <option value="">-- Choose a Factory --</option>
                  {factories.map(fac => (
                    <option key={fac.id} value={fac.id} className="bg-stone-950">{fac.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-300 mb-1">Request Quantity</label>
                <input 
                  type="number"
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(e.target.value)}
                  className="w-full p-2.5 bg-stone-950 border border-amber-900/30 rounded-lg text-sm text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowPopup(false)} className="flex-1 border border-stone-700 py-2.5 rounded-lg font-medium text-stone-400 hover:bg-stone-800">
                Ignore
              </button>

              <button
                onClick={sendRequest}
                disabled={!selectedReceiverId}
                className={`flex-1 py-2.5 rounded-lg font-bold text-white shadow-md transition-all ${
                  !selectedReceiverId ? 'bg-stone-700 cursor-not-allowed opacity-50' : ''
                }`}
                style={selectedReceiverId ? { background: 'linear-gradient(135deg, #b87333, #8b5a2b)' } : {}}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border border-amber-900/40"
          style={{ background: "linear-gradient(135deg, #b87333 0%, #8b5a2b 100%)" }}
        >
          <MessageSquare size={24} color="#ffffff" strokeWidth={2.5} />
        </button>
      )}

      {/* ─── 🚀 THE DECOUPLED CHAT BOX WINDOW ─── */}
      <KorvexCopilot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
}

const StatCard = ({ title, value, icon, trend, isAlert }) => (
  <div className="rounded-xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{ background: '#1c1410', borderColor: 'rgba(184,115,51,0.2)' }}>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(184,115,51,0.1)', borderColor: 'rgba(184,115,51,0.2)' }}>{icon}</div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${isAlert ? "bg-rose-950/60 text-rose-400 border border-rose-900/40" : "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40"}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">{title}</p>
        <h3 className={`text-2xl font-black mt-1 ${isAlert ? "text-rose-400" : "text-white"}`}>{value}</h3>
      </div>
    </div>
  </div>
);

export default WarehouseDashboard;
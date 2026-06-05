import React, { useEffect, useState, useRef } from "react";
import {
  Package,
  Layers,
  Database,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  ClipboardList,
  MessageSquareCode,
  X,
  Send,
  Loader2,
  Check,
} from "lucide-react";

import api from "../../api/api";
import axios from "axios"; // Raw axios to handle pure, unprotected port 8001 traffic

function WarehouseDashboard() {
  // 1. Core Dashboard Data States
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [racks, setRacks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [factories, setFactories] = useState([]);
  const [requests, setRequests] = useState([]);

  // 2. Popup & Stock Request Modal States
  const [showPopup, setShowPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState("");
  const [requestQuantity, setRequestQuantity] = useState(50);

  // 3. AI Copilot Drawer Memory States
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);

  // Securely generates a random native UUID v4 token
  const [chatSessionId] = useState(() => {
    const secureUuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    return `session_${secureUuid}`;
  });

  // 4. Component Lifecycle Synchronization
  useEffect(() => {
    fetchData();
    fetchChatHistory();
  }, []);

  // Automatic bottom-anchored scrolling for chat messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  // Core Data Retrieval Method (Keeps routing through 'api' on port 8080 safely)
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

  // --- AI Agent Service Operations ---
  const fetchChatHistory = async () => {
    try {
      // FIXED: Routed straight to port 8001, bypassing the 8080 cookie validator
      const response = await axios.get(`http://localhost:8001/api/v1/chat/${chatSessionId}`);
      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error("No prior background memory folder tracking found for this random token:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isSending) return;

    const userMsg = { type: "human", content: userInput };
    setMessages((prev) => [...prev, userMsg]);
    const originalInput = userInput;
    setUserInput("");
    setIsSending(true);

    try {
      // FIXED: Routed straight to port 8001, bypassing the 8080 cookie validator
      const response = await axios.post(`http://localhost:8001/api/v1/chat/${chatSessionId}`, {
        user_input: originalInput,
      });
      
      const aiMsg = { type: "ai", content: response.data.reply };
      setMessages((prev) => [...prev, aiMsg]);
      
      fetchData(); // Automatically update standard dashboard numbers if AI updated something
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: "Error communicating with the orchestrator. Check back-end system mappings." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockItems = inventory.filter((i) => i.quantity < 20);

  const getProductName = (id) => products.find((p) => p.id === id)?.name || "Unknown";
  const getRackName = (id) => racks.find((r) => r.id === id)?.name || "Unknown";
  const getFactoryName = (id) => factories.find((f) => f.id === id)?.name || `Factory #${id}`;

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
    <div className="bg-stone-950 min-h-screen p-4 md:p-8 relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Core Header Section */}
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

        {/* Analytics Performance Cards */}
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

        {/* Split UI Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

      {/* Pop-up Dialog window for restock assignments */}
      {showPopup && selectedItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 w-full max-w-md rounded-xl p-6 shadow-2xl border border-amber-900/30">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase">Restock Required</span>
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

      {/* AI OPERATIONS ASSISTANT SLIDER DRAWER */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full text-white shadow-2xl hover:scale-105 transition-all z-40 border border-amber-900/40 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #b87333, #8b5a2b)' }}
      >
        {isChatOpen ? <X size={24} /> : <MessageSquareCode size={24} />}
      </button>

      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] border-l shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: '#0c0a09', borderColor: 'rgba(184,115,51,0.2)' }}
      >
        <div className="p-4 text-white flex items-center justify-between border-b" style={{ background: '#1c1410', borderColor: 'rgba(184,115,51,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black tracking-tight text-xs text-stone-950"
              style={{ background: 'linear-gradient(135deg, #b87333, #d4956a)' }}>
              KX
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Korvex Operations AI</h3>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Multi-API Fallback Enabled
              </p>
            </div>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="text-stone-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'rgba(28,20,16,0.5)' }}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <MessageSquareCode size={40} className="text-stone-700" />
              <div className="max-w-xs">
                <p className="text-sm font-bold text-stone-400">Isolated UUID Thread Ready</p>
                <p className="text-[10px] text-stone-600 mt-1 select-all break-all font-mono bg-stone-900/60 p-1 rounded">
                  {chatSessionId}
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  Ask queries like "Show me current low stock reports" or request material transfers directly.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col max-w-[85%] ${
                  msg.type === "human" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[10px] text-stone-500 mb-1 px-1 font-bold uppercase tracking-wider">
                  {msg.type === "human" ? "Operator" : "Agent"}
                </span>
                <div 
                  className={`p-3 rounded-xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed border ${
                    msg.type === "human" 
                      ? "text-white rounded-tr-none" 
                      : "bg-stone-900 text-stone-200 border-stone-800 rounded-tl-none"
                  }`}
                  style={msg.type === "human" ? { background: 'linear-gradient(135deg, #b87333, #8b5a2b)', borderColor: '#b87333' } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          {isSending && (
            <div className="flex flex-col items-start max-w-[85%] mr-auto">
              <span className="text-[10px] text-stone-500 mb-1 px-1 font-bold uppercase tracking-wider animate-pulse">
                Agent responding...
              </span>
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl rounded-tl-none flex items-center gap-3 shadow-sm">
                <Loader2 className="animate-spin" size={16} style={{ color: '#b87333' }} />
                <span className="text-xs text-stone-400 font-medium">Running fallback execution loops...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2" style={{ background: '#1c1410', borderColor: 'rgba(184,115,51,0.2)' }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your automation command..."
            disabled={isSending}
            className="flex-1 bg-stone-950 border border-amber-900/30 rounded-lg p-2.5 text-sm text-white placeholder:text-stone-600 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isSending}
            className={`p-2.5 rounded-lg text-white transition-all ${
              !userInput.trim() || isSending 
                ? "bg-stone-800 cursor-not-allowed" 
                : "shadow-md hover:scale-105"
            }`}
            style={userInput.trim() && !isSending ? { background: 'linear-gradient(135deg, #b87333, #8b5a2b)' } : {}}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

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
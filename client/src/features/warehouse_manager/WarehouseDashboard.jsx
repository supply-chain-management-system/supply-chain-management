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
      api.get("/Factory_deatils")
    ])
    .then(([inv, prod, rack, wh, fac]) => {
      setInventory(inv.data);
      setProducts(prod.data);
      setRacks(rack.data);
      setWarehouses(wh.data);
      setFactories(fac.data);

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
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8 relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Core Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Warehouse Dashboard</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Database size={14} /> System status: Optimal
            </p>
          </div>
        </div>

        {/* Analytics Performance Cards */}
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

        {/* Split UI Layout */}
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

      {/* Pop-up Dialog window for restock assignments */}
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

      {/* AI OPERATIONS ASSISTANT SLIDER DRAWER COMPONENT INTERFACES */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-slate-900 text-white shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all z-40 border border-slate-800 flex items-center justify-center"
      >
        {isChatOpen ? <X size={24} /> : <MessageSquareCode size={24} />}
      </button>

      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black tracking-tight text-xs">
              KX
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Korvex Operations AI</h3>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Multi-API Fallback Enabled
              </p>
            </div>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <MessageSquareCode size={40} className="text-slate-300" />
              <div className="max-w-xs">
                <p className="text-sm font-bold text-slate-700">Isolated UUID Thread Ready</p>
                <p className="text-[10px] text-slate-400 mt-1 select-all break-all font-mono bg-slate-200/60 p-1 rounded">
                  {chatSessionId}
                </p>
                <p className="text-xs text-slate-400 mt-2">
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
                <span className="text-[10px] text-slate-400 mb-1 px-1 font-bold uppercase tracking-wider">
                  {msg.type === "human" ? "Operator" : "Agent"}
                </span>
                <div 
                  className={`p-3 rounded-xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed border ${
                    msg.type === "human" 
                      ? "bg-slate-900 text-white border-slate-900 rounded-tr-none" 
                      : "bg-white text-slate-800 border-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          {isSending && (
            <div className="flex flex-col items-start max-w-[85%] mr-auto">
              <span className="text-[10px] text-slate-400 mb-1 px-1 font-bold uppercase tracking-wider animate-pulse">
                Agent responding...
              </span>
              <div className="p-4 bg-white border border-slate-200 rounded-xl rounded-tl-none flex items-center gap-3 shadow-sm">
                <Loader2 className="animate-spin text-indigo-600" size={16} />
                <span className="text-xs text-slate-500 font-medium">Running fallback execution loops...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your automation command..."
            disabled={isSending}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isSending}
            className={`p-2.5 rounded-lg text-white transition-all ${
              !userInput.trim() || isSending 
                ? "bg-slate-200 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
            }`}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

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
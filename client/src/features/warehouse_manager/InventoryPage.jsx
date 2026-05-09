import React, { useEffect, useState } from "react";
import { 
  PackagePlus, 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  Download,
  MoreVertical,
  History,
  Box
} from "lucide-react";
import api from "../../api/api";

function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [racks, setRacks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const [form, setForm] = useState({
    product_id: "",
    rack_id: "",
    quantity: "",
    type: "IN",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [p, r, i] = await Promise.all([
        api.get("/ware_products"),
        api.get("/racks"),
        api.get("/inventory")
      ]);
      setProducts(p.data);
      setRacks(r.data);
      setInventory(i.data);
    } catch (err) {
      console.error("Failed to fetch inventory data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/inventory", form);
    setForm({ product_id: "", rack_id: "", quantity: "", type: "IN" });
    fetchAll();
  };

  const getProductName = (id) => products.find((x) => x.id === id)?.name || `ID: ${id}`;
  const getRackName = (id) => racks.find((x) => x.id === id)?.name || `Rack ${id}`;

  // Filtered logic for search and type
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = getProductName(item.product_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Control</h1>
            <p className="text-slate-500 font-medium">Monitor stock movements and rack assignments.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={16} /> Export
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
              <History size={16} /> Movement Log
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: UPDATE FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <PackagePlus className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Update Stock</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Select Product</label>
                  <select
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}
                    className="w-full mt-1 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-slate-50 font-medium text-slate-700"
                    required
                  >
                    <option value="">Choose product...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Target Rack</label>
                  <select
                    value={form.rack_id}
                    onChange={(e) => setForm({ ...form, rack_id: Number(e.target.value) })}
                    className="w-full mt-1 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-slate-50 font-medium text-slate-700"
                    required
                  >
                    <option value="">Choose rack...</option>
                    {racks.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Quantity</label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                      className="w-full mt-1 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-medium"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Movement</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className={`w-full mt-1 border p-3 rounded-xl outline-none font-bold transition-all ${
                        form.type === "IN" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}
                    >
                      <option value="IN">STOCK IN</option>
                      <option value="OUT">STOCK OUT</option>
                    </select>
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2">
                  Complete Transaction
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: INVENTORY LIST */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* TABLE CONTROLS */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search inventory..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <select 
                    className="text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none bg-white font-semibold text-slate-600"
                    onChange={(e) => setFilterType(e.target.value)}
                   >
                     <option value="ALL">All Types</option>
                     <option value="IN">Inbound</option>
                     <option value="OUT">Outbound</option>
                   </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Item Description</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredInventory.length > 0 ? filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500 font-bold text-xs">
                              <Box size={14} />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{getProductName(item.product_id)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {getRackName(item.rack_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {item.type === "IN" ? (
                              <>
                                <ArrowUpCircle size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase">Inbound</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownCircle size={14} className="text-rose-500" />
                                <span className="text-[10px] font-black text-rose-600 uppercase">Outbound</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-black ${item.quantity < 20 ? "text-rose-600" : "text-slate-700"}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-300 hover:text-slate-600 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center opacity-40">
                             <Search size={48} />
                             <p className="mt-2 font-bold">No inventory matches your search</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default InventoryPage;
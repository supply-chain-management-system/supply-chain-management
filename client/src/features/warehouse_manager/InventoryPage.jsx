import React, { useEffect, useState } from "react";
import { 
  PackagePlus, 
  Search, 
  Download,
  History,
  Box,
  Edit3,
  Trash2,
  X
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
    batch_number: "",
    expiry_date: "",
    status: "available",
  });

  // Edit Modal States
  const [editingInventory, setEditingInventory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    quantity: "",
    batch_number: "",
    expiry_date: "",
    status: "available"
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
    const payload = {
      product_id: Number(form.product_id),
      rack_id: Number(form.rack_id),
      quantity: Number(form.quantity),
      type: form.type,
      batch_number: form.batch_number || null,
      expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
      status: form.status,
    };
    try {
      await api.post("/inventory", payload);
      alert("Stock transaction completed successfully ✅");
      setForm({
        product_id: "",
        rack_id: "",
        quantity: "",
        type: "IN",
        batch_number: "",
        expiry_date: "",
        status: "available",
      });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Stock transaction failed");
    }
  };

  const handleOpenEdit = (item) => {
    setEditingInventory(item);
    setEditForm({
      quantity: item.quantity.toString(),
      batch_number: item.batch_number || "",
      expiry_date: item.expiry_date ? item.expiry_date.split("T")[0] : "",
      status: item.status || "available"
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        quantity: Number(editForm.quantity),
        batch_number: editForm.batch_number || null,
        expiry_date: editForm.expiry_date ? new Date(editForm.expiry_date).toISOString() : null,
        status: editForm.status
      };
      await api.put(`/inventory/${editingInventory.id}`, payload);
      alert("Inventory record updated successfully ✅");
      setShowEditModal(false);
      setEditingInventory(null);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update inventory record");
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory record?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      alert("Inventory record deleted successfully ✅");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to delete inventory record");
    }
  };

  const getProductName = (id) => products.find((x) => x.id === id)?.name || `ID: ${id}`;
  const getRackName = (id) => racks.find((x) => x.id === id)?.name || `Rack ${id}`;

  // Filtered logic for search and product type
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = getProductName(item.product_id).toLowerCase().includes(searchTerm.toLowerCase());
    const productType = products.find((x) => x.id === item.product_id)?.type || "";
    const matchesType = filterType === "ALL" || productType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#0c0a09' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #b87333, #8b5a2b)' }} />
              <h1 className="text-3xl font-black text-white tracking-tight">Inventory Control</h1>
            </div>
            <p className="text-stone-500 font-medium ml-4">Monitor stock movements and rack assignments.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-stone-400 hover:text-white transition-all shadow-sm"
              style={{ background:'#1c1410', border:'1px solid rgba(184,115,51,0.2)' }}>
              Movement Log
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: UPDATE FORM */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl p-6 sticky top-8" style={{ background:'#1c1410', border:'1px solid rgba(184,115,51,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ background:'rgba(184,115,51,0.12)' }}>
                  <PackagePlus style={{ color: '#b87333' }} size={24} />
                </div>
                <h2 className="text-lg font-bold text-white">Update Stock</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase ml-1">Select Product</label>
                  <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}
                    className="w-full mt-1 p-3 rounded-xl outline-none font-medium text-white"
                    style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }} required>
                    <option value="" className="bg-stone-950">Choose product...</option>
                    {products.map((p) => <option key={p.id} value={p.id} className="bg-stone-950">{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase ml-1">Target Rack</label>
                  <select value={form.rack_id} onChange={(e) => setForm({ ...form, rack_id: Number(e.target.value) })}
                    className="w-full mt-1 p-3 rounded-xl outline-none font-medium text-white"
                    style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }} required>
                    <option value="" className="bg-stone-950">Choose rack...</option>
                    {racks.map((r) => <option key={r.id} value={r.id} className="bg-stone-950">{r.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase ml-1">Quantity</label>
                    <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                      className="w-full mt-1 p-3 rounded-xl outline-none font-medium text-white" placeholder="0" required
                      style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase ml-1">Movement</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className={`w-full mt-1 p-3 rounded-xl outline-none font-bold transition-all ${
                        form.type === "IN" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40" : "bg-rose-950/60 text-rose-400 border border-rose-900/40"
                      }`}>
                      <option value="IN" className="bg-stone-950">STOCK IN</option>
                      <option value="OUT" className="bg-stone-950">STOCK OUT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase ml-1">Batch Number</label>
                    <input type="text" value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl outline-none font-medium text-white text-sm" placeholder="e.g. BATCH-001"
                      style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase ml-1">Expiry Date</label>
                    <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                      className="w-full mt-1 p-3 rounded-xl outline-none font-medium text-white text-sm"
                      style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)', colorScheme:'dark' }} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase ml-1">Inventory Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl outline-none font-bold text-white text-sm"
                    style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }}>
                    <option value="available" className="bg-stone-950">Available (Quality Passed)</option>
                    <option value="quarantine" className="bg-stone-950">Quarantine (Pending inspection)</option>
                    <option value="damaged" className="bg-stone-950">Damaged / Rejected</option>
                  </select>
                </div>

                <button className="w-full text-white py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg"
                  style={{ background:'linear-gradient(135deg, #b87333, #8b5a2b)' }}>
                  Complete Transaction
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: INVENTORY LIST */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl overflow-hidden" style={{ background:'#1c1410', border:'1px solid rgba(184,115,51,0.2)' }}>
              
              {/* TABLE CONTROLS */}
              <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-center" style={{ borderBottom:'1px solid rgba(184,115,51,0.2)', background:'rgba(184,115,51,0.04)' }}>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                  <input type="text" placeholder="Search inventory..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder:text-stone-600 outline-none"
                    style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }}
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select className="text-sm rounded-lg px-3 py-2 outline-none font-semibold text-stone-400"
                    style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }}
                    onChange={(e) => setFilterType(e.target.value)}>
                    <option value="ALL" className="bg-stone-950">All Product Types</option>
                    <option value="finished_good" className="bg-stone-950">Finished Goods</option>
                    <option value="raw_material" className="bg-stone-950">Raw Materials</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ background:'rgba(184,115,51,0.06)', borderBottom:'1px solid rgba(184,115,51,0.15)' }}>
                    <tr>
                      {['Item Description','Location','Batch & Expiry','Status','Type','Quantity',''].map((h,i) => (
                        <th key={i} className={`px-6 py-4 text-[11px] font-black text-stone-500 uppercase tracking-widest ${i===5?'text-right':''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.length > 0 ? filteredInventory.map((item) => (
                      <tr key={item.id} className="group transition-colors" style={{ borderBottom:'1px solid rgba(184,115,51,0.08)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(184,115,51,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background:'rgba(184,115,51,0.1)' }}>
                              <Box size={14} style={{ color:'#b87333' }} />
                            </div>
                            <span className="text-sm font-bold text-white">{getProductName(item.product_id)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-stone-400 px-2 py-1 rounded" style={{ background:'rgba(184,115,51,0.1)' }}>
                            {getRackName(item.rack_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            {item.batch_number ? (
                              <span className="text-xs font-mono font-bold text-stone-400">Lot: {item.batch_number}</span>
                            ) : (
                              <span className="text-xs text-stone-600 italic">No Batch</span>
                            )}
                            {item.expiry_date && (
                              <span className="text-[10px] text-rose-400 font-semibold mt-0.5">Exp: {new Date(item.expiry_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            item.status === "damaged" ? "bg-rose-950/50 text-rose-400 border-rose-900/40" :
                            item.status === "quarantine" ? "bg-amber-950/50 text-amber-400 border-amber-900/40" : "bg-emerald-950/50 text-emerald-400 border-emerald-900/40"
                          }`}>{item.status || "available"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                            style={((products.find((x) => x.id === item.product_id)?.type||"")==="finished_good")
                              ? { background:'rgba(184,115,51,0.12)', color:'#d4956a', border:'1px solid rgba(184,115,51,0.2)' }
                              : { background:'rgba(139,92,246,0.1)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.2)' }}>
                            {(products.find((x) => x.id === item.product_id)?.type||"").replace("_"," ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-black ${item.quantity < 20 ? "text-rose-400" : "text-white"}`}>{item.quantity}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-stone-500 hover:text-amber-400 rounded-lg transition-colors"
                              onMouseEnter={e => e.currentTarget.style.background='rgba(184,115,51,0.12)'}
                              onMouseLeave={e => e.currentTarget.style.background=''}>
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => handleDeleteInventory(item.id)}
                              className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg transition-colors"
                              onMouseEnter={e => e.currentTarget.style.background='rgba(244,63,94,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.background=''}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="7" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center opacity-30">
                          <Search size={48} className="text-stone-600" />
                          <p className="mt-2 font-bold text-stone-500">No inventory matches your search</p>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT INVENTORY MODAL */}
      {showEditModal && editingInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" style={{ background:'#1c1410', border:'1px solid rgba(184,115,51,0.25)' }}>
            
            <div className="px-6 py-5 text-white flex justify-between items-center" style={{ background:'linear-gradient(135deg, #b87333, #8b5a2b)' }}>
              <div>
                <h3 className="text-lg font-black tracking-tight">Edit Inventory Record</h3>
                <p className="text-amber-100 text-xs font-semibold mt-0.5">
                  {getProductName(editingInventory.product_id)} • {getRackName(editingInventory.rack_id)}
                </p>
              </div>
              <button onClick={() => { setShowEditModal(false); setEditingInventory(null); }}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest ml-1 block mb-1">Override Quantity</label>
                <input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  className="w-full p-3 rounded-xl outline-none font-bold text-white" placeholder="0" required
                  style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest ml-1 block mb-1">Batch Number</label>
                  <input type="text" value={editForm.batch_number} onChange={(e) => setEditForm({ ...editForm, batch_number: e.target.value })}
                    className="w-full p-3 rounded-xl outline-none font-semibold text-sm text-white" placeholder="e.g. BATCH-001"
                    style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest ml-1 block mb-1">Expiry Date</label>
                  <input type="date" value={editForm.expiry_date} onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                    className="w-full p-3 rounded-xl outline-none font-medium text-sm text-white"
                    style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)', colorScheme:'dark' }} />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest ml-1 block mb-1">Inventory Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full p-3 rounded-xl outline-none font-bold text-white text-sm"
                  style={{ background:'#0c0a09', border:'1px solid rgba(184,115,51,0.2)' }}>
                  <option value="available" className="bg-stone-950">Available (Quality Passed)</option>
                  <option value="quarantine" className="bg-stone-950">Quarantine (Pending inspection)</option>
                  <option value="damaged" className="bg-stone-950">Damaged / Rejected</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3" style={{ borderTop:'1px solid rgba(184,115,51,0.15)' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingInventory(null); }}
                  className="flex-1 py-3 rounded-xl font-bold text-stone-400 hover:text-white transition-all"
                  style={{ background:'transparent', border:'1px solid rgba(184,115,51,0.2)' }}>Cancel</button>
                <button type="submit" className="flex-1 text-white py-3 rounded-xl font-bold transition-all shadow-md hover:opacity-90"
                  style={{ background:'linear-gradient(135deg, #b87333, #8b5a2b)' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryPage;
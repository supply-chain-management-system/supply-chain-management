import React, { useEffect, useState } from "react";
import { 
  Layers, 
  Plus, 
  Warehouse, 
  MapPin, 
  Search, 
  MoreHorizontal, 
  Trash2,
  BoxSelect,
  MessageSquare // 🚀 Imported for the float trigger
} from "lucide-react";
import api from "../../api/api";
import KorvexCopilot from "../KorvexCopilot";
function RackPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [racks, setRacks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    warehouse_id: "",
    zone: "",
    max_weight: "5000.0",
    rows: "5"
  });

  const [editingRack, setEditingRack] = useState(null);

  const handleOpenEditRack = (rack) => {
    setEditingRack(rack);
    setForm({
      name: rack.name || "",
      warehouse_id: rack.warehouse_id || "",
      zone: rack.zone || "",
      max_weight: rack.max_weight?.toString() || "5000.0",
      rows: rack.rows?.toString() || "5"
    });
  };

  const handleCancelEdit = () => {
    setEditingRack(null);
    setForm({ name: "", warehouse_id: "", zone: "", max_weight: "5000.0", rows: "5" });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const r = await api.get("/racks");
      const w = await api.get("/ware_house");
      setRacks(r.data);
      setWarehouses(w.data);
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      warehouse_id: Number(form.warehouse_id),
      zone: form.zone || null,
      max_weight: parseFloat(form.max_weight) || 5000.0,
      rows: parseInt(form.rows) || 5
    };
    try {
      if (editingRack) {
        await api.put(`/racks/${editingRack.id}`, payload);
        alert("Rack updated successfully ✅");
      } else {
        await api.post("/racks", payload);
        alert("Rack created successfully ✅");
      }
      handleCancelEdit();
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to save rack");
    }
  };

  const handleDeleteRack = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rack?")) return;
    try {
      await api.delete(`/racks/${id}`);
      alert("Rack deleted successfully ✅");
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to delete rack");
    }
  };

  const getWarehouseName = (id) => {
    const w = warehouses.find((x) => x.id === id);
    return w ? w.name : `WH-${id}`;
  };

  const filteredRacks = racks.filter(rack => 
    rack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getWarehouseName(rack.warehouse_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-10 relative" style={{ background: '#0c0a09' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #b87333, #8b5a2b)' }} />
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Layers style={{ color: '#b87333' }} size={32} />
                Rack Architecture
              </h1>
            </div>
            <p className="text-stone-500 font-medium mt-1 ml-4">Define storage structures and section assignments.</p>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 transition-colors" size={18} />
            <input type="text" placeholder="Filter by name or facility..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-stone-600 outline-none transition-all w-72"
              style={{ background: '#1c1410', border: '1px solid rgba(184,115,51,0.2)' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: CONFIGURATION FORM */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl p-6 sticky top-6" style={{ background: '#1c1410', border: '1px solid rgba(184,115,51,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(184,115,51,0.12)', color: '#b87333' }}>
                  <BoxSelect size={20} />
                </div>
                <h2 className="text-lg font-bold text-white">{editingRack ? "Edit Storage Unit" : "New Storage Unit"}</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Rack Designation</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                    <input type="text" placeholder="e.g. Section-A-01" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-sm font-medium text-white"
                      style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.2)' }} required />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Assigned Facility</label>
                  <div className="relative">
                    <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                    <select value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-sm font-bold text-white appearance-none"
                      style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.2)' }} required>
                      <option value="" className="bg-stone-950">Select Warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id} className="bg-stone-950">{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Storage Zone</label>
                  <input type="text" placeholder="e.g. Cold Storage, Hazardous" value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl outline-none text-sm font-medium text-white"
                    style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.2)' }} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Max Weight (kg)</label>
                    <input type="number" value={form.max_weight} onChange={(e) => setForm({ ...form, max_weight: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm font-medium text-white"
                      style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.2)' }} required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5 block ml-1">Shelves / Rows</label>
                    <input type="number" value={form.rows} onChange={(e) => setForm({ ...form, rows: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl outline-none text-sm font-medium text-white"
                      style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.2)' }} required />
                  </div>
                </div>

                {editingRack ? (
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={handleCancelEdit}
                      className="flex-1 py-4 rounded-xl font-bold text-stone-400 hover:text-white transition-all text-sm"
                      style={{ border: '1px solid rgba(184,115,51,0.2)' }}>Cancel</button>
                    <button type="submit"
                      className="flex-1 text-white py-4 rounded-xl font-bold transition-all shadow-lg text-sm hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #b87333, #8b5a2b)' }}>Update</button>
                  </div>
                ) : (
                  <button className="w-full text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 transition-all hover:opacity-90 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #b87333, #8b5a2b)' }}>
                    <Plus size={18} /> Deploy Rack
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* RIGHT: RACK GRID/LIST */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl overflow-hidden" style={{ background: '#1c1410', border: '1px solid rgba(184,115,51,0.2)' }}>
              <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(184,115,51,0.2)', background: 'rgba(184,115,51,0.04)' }}>
                <h3 className="font-bold text-white">Active Racks</h3>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase" style={{ color: '#d4956a', background: 'rgba(184,115,51,0.12)' }}>
                  {filteredRacks.length} Units Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ background: 'rgba(184,115,51,0.06)' }}>
                    <tr>
                      {['Rack Identity','Facility Location','Zone Details','Capacity / Rows','Status'].map((h,i) => (
                        <th key={h} className={`px-6 py-4 text-[11px] font-black text-stone-500 uppercase tracking-widest ${i===4?'text-right':''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRacks.map((r) => (
                      <tr key={r.id} className="group transition-colors" style={{ borderBottom: '1px solid rgba(184,115,51,0.08)' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(184,115,51,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs"
                              style={{ background: 'rgba(184,115,51,0.12)', color: '#d4956a', border: '1px solid rgba(184,115,51,0.2)' }}>
                              {r.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-white">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-stone-500">
                            <Warehouse size={14} className="text-stone-600" />
                            <span className="text-xs font-semibold">{getWarehouseName(r.warehouse_id)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider"
                            style={r.zone
                              ? { background:'rgba(184,115,51,0.1)', color:'#d4956a', borderColor:'rgba(184,115,51,0.25)' }
                              : { background:'rgba(255,255,255,0.04)', color:'#78716c', borderColor:'rgba(255,255,255,0.08)' }}>
                            {r.zone || "General Zone"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-stone-400">
                            <span className="text-xs font-semibold">Max: {r.max_weight || 5000.0} kg</span>
                            <span className="text-[10px] text-stone-600 font-medium mt-0.5">{r.rows || 5} Levels/Rows</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">Active</span>
                            <button onClick={() => handleOpenEditRack(r)}
                              className="p-1.5 text-stone-600 rounded-lg transition-all"
                              onMouseEnter={e => { e.currentTarget.style.background='rgba(184,115,51,0.12)'; e.currentTarget.style.color='#d4956a'; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteRack(r.id)}
                              className="p-1.5 text-stone-600 rounded-lg transition-all"
                              onMouseEnter={e => { e.currentTarget.style.background='rgba(244,63,94,0.1)'; e.currentTarget.style.color='#fb7185'; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredRacks.length === 0 && (
                  <div className="py-20 text-center">
                    <Layers className="mx-auto text-stone-800 mb-4" size={48} />
                    <p className="text-stone-600 font-medium italic text-sm">No racks found for this selection.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── FLOATING CHAT BUTTON ─── */}
      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #b87333 0%, #8b5a2b 100%)" }}>
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

export default RackPage;
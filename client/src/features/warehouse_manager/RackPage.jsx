import React, { useEffect, useState } from "react";
import { 
  Layers, 
  Plus, 
  Warehouse, 
  MapPin, 
  Search, 
  MoreHorizontal, 
  Trash2,
  BoxSelect
} from "lucide-react";
import api from "../../api/api";

function RackPage() {
  const [racks, setRacks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    warehouse_id: "",
  });

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
    await api.post("/racks", {
      ...form,
      warehouse_id: Number(form.warehouse_id),
    });
    setForm({ name: "", warehouse_id: "" });
    fetchAll();
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
    <div className="bg-[#f8fafc] min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Layers className="text-indigo-600" size={32} />
              Rack Architecture
            </h1>
            <p className="text-slate-500 font-medium mt-1">Define storage structures and section assignments.</p>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name or facility..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-72 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: CONFIGURATION FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <BoxSelect size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800">New Storage Unit</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
                    Rack Designation
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Section-A-01"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
                    Assigned Facility
                  </label>
                  <div className="relative">
                    <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <select
                      value={form.warehouse_id}
                      onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-bold text-slate-700 appearance-none"
                      required
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 mt-2">
                  <Plus size={18} /> Deploy Rack
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: RACK GRID/LIST */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                <h3 className="font-bold text-slate-800">Active Racks</h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">
                  {filteredRacks.length} Units Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Rack Identity</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Facility Location</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRacks.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs border border-indigo-100">
                              {r.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Warehouse size={14} className="text-slate-300" />
                            <span className="text-xs font-semibold">{getWarehouseName(r.warehouse_id)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-3">
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Active</span>
                              <button className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
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
                    <Layers className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-medium italic text-sm">No racks found for this selection.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RackPage;
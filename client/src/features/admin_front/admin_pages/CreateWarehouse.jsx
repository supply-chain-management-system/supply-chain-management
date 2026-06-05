import React, { useEffect, useState } from "react";
import { Warehouse, Plus, MapPin, Search, Building2, Globe, MoreVertical, Trash2 } from "lucide-react";
import api from "../../../api/api";

function CreateWarehouse() {
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = () => {
    api.get("/ware_house")
      .then((res) => setWarehouses(res.data))
      .catch((err) => console.log(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("/ware_house", form)
      .then(() => {
        setForm({ name: "", location: "" });
        fetchWarehouses();
        alert("deploy warehouse")
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteWarehouse = (id) => {
    if (!window.confirm("Are you sure you want to delete this facility? All associated racks and inventory data will be lost.")) return;
    api.delete(`/ware_house/${id}`)
      .then(() => {
        fetchWarehouses();
        alert("Facility deleted successfully");
      })
      .catch((err) => {
        console.error("Delete facility error:", err);
        alert(err.response?.data?.detail || "Failed to delete facility");
      });
  };

  const filteredWarehouses = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    /* ml-64 added for Admin Sidebar compatibility */
    <div className="bg-[#f8fafc] min-h-screen p-8">
      
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER & TOP STATS */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Warehouse className="text-indigo-600" size={32} />
              Facility Operations
            </h1>
            <p className="text-slate-500 font-medium mt-1">Configure global warehouse nodes and distribution centers.</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Facilities</p>
              <p className="text-2xl font-black text-slate-800">{warehouses.length}</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Regions</p>
              <p className="text-2xl font-black text-indigo-600">
                {[...new Set(warehouses.map(w => w.location.split(',')[0]))].length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: FACILITY REGISTRATION */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-100">
                  <Building2 size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">New Facility</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                    Formal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. North Hub Distribution"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                    Geographic Location
                  </label>
                  <div className="relative group">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full border border-slate-200 rounded-2xl pl-12 pr-5 py-4 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-slate-700"
                      required
                    />
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black hover:-translate-y-1 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 mt-4">
                  <Plus size={20} />
                  Deploy Facility
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: FACILITY DIRECTORY */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* TABLE ACTIONS */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Globe size={18} className="text-slate-400" />
                  Facility Directory
                </h3>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Facility Details</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Geo-Coordinates</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredWarehouses.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs border border-indigo-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {w.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{w.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: WH-{w.id.toString().padStart(3, '0')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-slate-600">
                            <div className="p-1.5 bg-slate-100 rounded-md">
                              <MapPin size={12} className="text-slate-400" />
                            </div>
                            <span className="text-sm font-semibold">{w.location}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => handleDeleteWarehouse(w.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredWarehouses.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="bg-slate-50 inline-block p-6 rounded-full mb-4">
                       <Warehouse size={48} className="text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold italic">No facility matches found.</p>
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

export default CreateWarehouse;
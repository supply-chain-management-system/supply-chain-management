import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Package, 
  Tag, 
  Hash, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Filter
} from "lucide-react";
import api from "../../api/api";

function WareProduct() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    sku: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/ware_products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  api.post("/ware_products", form)
    .then((res) => {
      setForm({ name: "", sku: "" });
      fetchProducts();
      alert("product add sucessfuly")
    })
    .catch((err) => {
      console.error("Submission error", err);
    });
};

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Package className="text-indigo-600" size={32} />
              Catalog Manager
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage warehouse stock definitions and SKU mapping.</p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search catalog..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-64 shadow-sm"
                />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: ADD PRODUCT FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-indigo-500" />
                Register Product
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">
                    Product Display Name
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Industrial Engine"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">
                    SKU Identifier
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      placeholder="SKU-XXXX-XXXX"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-mono"
                      required
                    />
                  </div>
                </div>

                <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-2">
                  <Plus size={18} /> Add to Catalog
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: PRODUCT TABLE */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Product List ({filteredProducts.length})</h3>
                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                  <Filter size={18} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                      <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-400 font-mono">#{p.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{p.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase mt-0.5">SKU: {p.sku}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                <Edit3 size={16} />
                             </button>
                             <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                <Trash2 size={16} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-20 text-center text-slate-400 italic text-sm">
                          No products found in the catalog.
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

export default WareProduct;
import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Package, 
  Tag, 
  Hash, 
  Edit3, 
  Trash2,
  FileText,
  X,
  PlusCircle,
} from "lucide-react";
import api from "../../api/api";

// ─── Copper palette helpers ───────────────────────────────────────────────
const CU = {
  bg: '#0c0a09',          // stone-950
  card: '#1c1410',        // warm dark
  border: 'rgba(184,115,51,0.2)',
  accent: '#b87333',
  accentLight: '#d4956a',
  accentDark: '#8b5a2b',
};

function WareProduct() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({
    name: "", sku: "", type: "finished_good",
    cost: 0.0, price: 0.0, weight: 1.0, min_stock_level: 10
  });

  const [showBOMModal, setShowBOMModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bomItems, setBomItems] = useState([]);
  const [newBOMItem, setNewBOMItem] = useState({ material_product_id: "", quantity_required: "1.0" });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try { const res = await api.get("/ware_products"); setProducts(res.data); }
    catch (err) { console.error("Failed to load products", err); }
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setForm({ name: product.name||"", sku: product.sku||"", type: product.type||"finished_good",
      cost: product.cost||0.0, price: product.price||0.0, weight: product.weight||1.0, min_stock_level: product.min_stock_level||10 });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setForm({ name:"", sku:"", type:"finished_good", cost:0.0, price:0.0, weight:1.0, min_stock_level:10 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      api.put(`/ware_products/${editingProduct.id}`, form)
        .then(() => { handleCancelEdit(); fetchProducts(); alert("Product updated ✅"); })
        .catch(() => alert("Failed to update product"));
    } else {
      api.post("/ware_products", form)
        .then(() => { handleCancelEdit(); fetchProducts(); alert("Product registered ✅"); })
        .catch(() => alert("Failed to register product"));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product and all its inventory records?")) return;
    try { await api.delete(`/ware_products/${id}`); fetchProducts(); }
    catch (err) { console.error(err); alert(err.response?.data?.detail || "Failed to delete product"); }
  };

  const openBOMModal = async (product) => {
    setSelectedProduct(product); setShowBOMModal(true);
    setNewBOMItem({ material_product_id: "", quantity_required: "1.0" });
    try { const res = await api.get(`/bill_of_materials?finished_product_id=${product.id}`); setBomItems(res.data); }
    catch (err) { console.error("Failed to load BOM items", err); }
  };

  const handleAddBOMItem = async (e) => {
    e.preventDefault();
    if (!newBOMItem.material_product_id) return alert("Please select a raw material component");
    try {
      await api.post("/bill_of_materials", { finished_product_id: selectedProduct.id,
        material_product_id: Number(newBOMItem.material_product_id), quantity_required: Number(newBOMItem.quantity_required) });
      const res = await api.get(`/bill_of_materials?finished_product_id=${selectedProduct.id}`);
      setBomItems(res.data); setNewBOMItem({ material_product_id: "", quantity_required: "1.0" });
    } catch (err) { alert(err.response?.data?.detail || "Failed to add component"); }
  };

  const handleDeleteBOMItem = async (id) => {
    if (!window.confirm("Remove this component?")) return;
    try {
      await api.delete(`/bill_of_materials/${id}`);
      const res = await api.get(`/bill_of_materials?finished_product_id=${selectedProduct.id}`);
      setBomItems(res.data);
    } catch (err) { alert("Failed to delete component"); }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" ? true : p.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const getProductName = (id) => { const p = products.find(prod => prod.id === id); return p ? p.name : `Component #${id}`; };
  const rawMaterials = products.filter(p => p.type === "raw_material");

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder:text-stone-600 outline-none transition-all";

  return (
    <div className="min-h-screen p-6 md:p-10 relative" style={{ background: CU.bg }}>
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 rounded-full" style={{ background: `linear-gradient(180deg, ${CU.accent}, ${CU.accentDark})` }} />
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Package style={{ color: CU.accent }} className="w-8 h-8" />
                Catalog Manager
              </h1>
            </div>
            <p className="text-stone-500 font-medium mt-1 ml-4">Manage warehouse stock definitions, SKU mapping, and recipes.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input type="text" placeholder="Search catalog..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-stone-600 outline-none w-64"
              style={{ background: CU.card, border: `1px solid ${CU.border}` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: ADD/EDIT FORM */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl p-6 sticky top-6" style={{ background: CU.card, border: `1px solid ${CU.border}` }}>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Plus size={20} style={{ color: CU.accent }} />
                {editingProduct ? "Edit Product Specs" : "Register Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block ml-1">Product Name</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                    <input type="text" placeholder="e.g. Industrial Engine" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`${inputCls} pl-10`} style={{ background: '#0c0a09', border: `1px solid ${CU.border}` }} required />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block ml-1">SKU Identifier</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600" size={16} />
                    <input type="text" placeholder="SKU-XXXX-XXXX" value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className={`${inputCls} pl-10 font-mono`} style={{ background: '#0c0a09', border: `1px solid ${CU.border}` }} required />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block ml-1">Classification</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={`${inputCls} font-semibold`} style={{ background: '#0c0a09', border: `1px solid ${CU.border}` }} required>
                    <option value="finished_good" className="bg-stone-950">Finished Good (Output)</option>
                    <option value="raw_material" className="bg-stone-950">Raw Material (Input)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[['cost','Unit Cost ($)'],['price','Unit Price ($)']].map(([k,label]) => (
                    <div key={k}>
                      <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block ml-1">{label}</label>
                      <input type="number" step="any" min="0" value={form[k]}
                        onChange={(e) => setForm({ ...form, [k]: parseFloat(e.target.value)||0 })}
                        className={inputCls} style={{ background: '#0c0a09', border: `1px solid ${CU.border}` }} required />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block ml-1">Weight (kg)</label>
                    <input type="number" step="any" min="0" value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value)||0 })}
                      className={inputCls} style={{ background: '#0c0a09', border: `1px solid ${CU.border}` }} required />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 block ml-1">Safety Stock</label>
                    <input type="number" min="0" value={form.min_stock_level}
                      onChange={(e) => setForm({ ...form, min_stock_level: parseInt(e.target.value)||0 })}
                      className={inputCls} style={{ background: '#0c0a09', border: `1px solid ${CU.border}` }} required />
                  </div>
                </div>

                {editingProduct ? (
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={handleCancelEdit}
                      className="flex-1 py-3.5 rounded-xl font-bold text-stone-400 hover:bg-stone-900 transition-all text-sm"
                      style={{ border: `1px solid ${CU.border}` }}>Cancel</button>
                    <button type="submit" className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg transition-all hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${CU.accent}, ${CU.accentDark})` }}>Update</button>
                  </div>
                ) : (
                  <button className="w-full py-3.5 rounded-xl font-bold text-white mt-2 flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${CU.accent}, ${CU.accentDark})` }}>
                    <Plus size={18} /> Add to Catalog
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* RIGHT: PRODUCT TABLE */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl overflow-hidden" style={{ background: CU.card, border: `1px solid ${CU.border}` }}>
              
              {/* Tabs */}
              <div className="flex px-6 py-4 justify-between items-center gap-4 flex-wrap" style={{ borderBottom: `1px solid ${CU.border}`, background: 'rgba(184,115,51,0.05)' }}>
                <div className="flex gap-2">
                  {[{ key:"all", label:"All Catalog" },{ key:"finished_good", label:"Finished Goods" },{ key:"raw_material", label:"Raw Materials" }].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={activeTab === tab.key
                        ? { background: `linear-gradient(135deg, ${CU.accent}, ${CU.accentDark})`, color: 'white' }
                        : { color: '#78716c', background: 'transparent' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: CU.accentLight }}>
                  {filteredProducts.length} items
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ background: 'rgba(184,115,51,0.06)', borderBottom: `1px solid ${CU.border}` }}>
                    <tr>
                      {['ID','Product Details','Classification','Cost / Price','Weight / Safety','Actions'].map((h,i) => (
                        <th key={h} className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest text-stone-500 ${i===5?'text-right':''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="group transition-colors" style={{ borderBottom: `1px solid rgba(184,115,51,0.08)` }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(184,115,51,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-stone-600 font-mono">#{p.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{p.name}</span>
                            <span className="text-[10px] font-bold text-stone-500 tracking-tighter uppercase mt-0.5">SKU: {p.sku}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                            style={p.type === "raw_material"
                              ? { background:'rgba(245,158,11,0.1)', color:'#d97706', borderColor:'rgba(245,158,11,0.2)' }
                              : { background:'rgba(16,185,129,0.1)', color:'#10b981', borderColor:'rgba(16,185,129,0.2)' }}>
                            {p.type === "raw_material" ? "Raw Material" : "Finished Good"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-stone-400">Cost: ${p.cost?.toFixed(2)}</span>
                            <span className="text-xs font-semibold" style={{ color: CU.accentLight }}>Price: ${p.price?.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-stone-400">Wt: {p.weight} kg</span>
                            <span className="text-xs font-semibold text-stone-600">Min: {p.min_stock_level} units</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {p.type === "finished_good" && (
                              <button onClick={() => openBOMModal(p)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1"
                                style={{ background:'rgba(184,115,51,0.12)', color: CU.accentLight, border:`1px solid ${CU.border}` }}>
                                <FileText size={14} /> Recipe
                              </button>
                            )}
                            <button onClick={() => handleOpenEditProduct(p)}
                              className="p-2 rounded-lg transition-all text-stone-500 hover:text-white"
                              style={{ '--hover-bg': 'rgba(184,115,51,0.15)' }}
                              onMouseEnter={e => { e.currentTarget.style.background='rgba(184,115,51,0.15)'; e.currentTarget.style.color=CU.accentLight; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}>
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 rounded-lg transition-all text-stone-500"
                              onMouseEnter={e => { e.currentTarget.style.background='rgba(244,63,94,0.1)'; e.currentTarget.style.color='#fb7185'; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr><td colSpan="6" className="py-20 text-center text-stone-600 italic text-sm">No products found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOM MODAL */}
      {showBOMModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowBOMModal(false)} />
          <div className="relative rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ background: CU.card, border: `1px solid ${CU.border}` }}>
            <div className="px-6 py-5 flex items-center justify-between text-white" style={{ background: `linear-gradient(135deg, ${CU.accent}, ${CU.accentDark})` }}>
              <div>
                <h2 className="text-lg font-bold">Product Recipe (BOM)</h2>
                <p className="text-amber-100 text-xs mt-0.5">Raw materials for: <span className="font-semibold text-white underline">{selectedProduct.name}</span></p>
              </div>
              <button onClick={() => setShowBOMModal(false)} className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              <form onSubmit={handleAddBOMItem} className="p-4 rounded-2xl space-y-4" style={{ background:'rgba(184,115,51,0.06)', border:`1px solid ${CU.border}` }}>
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Add Component</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <select value={newBOMItem.material_product_id}
                      onChange={(e) => setNewBOMItem({ ...newBOMItem, material_product_id: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl outline-none text-xs font-bold text-white appearance-none"
                      style={{ background: '#0c0a09', border: `1px solid ${CU.border}` }} required>
                      <option value="" className="bg-stone-950">Select Raw Material</option>
                      {rawMaterials.map((mat) => (
                        <option key={mat.id} value={mat.id} className="bg-stone-950">{mat.name} ({mat.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input type="number" step="any" min="0.001" required placeholder="Qty" value={newBOMItem.quantity_required}
                      onChange={(e) => setNewBOMItem({ ...newBOMItem, quantity_required: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl outline-none text-xs font-bold text-white"
                      style={{ background: '#0c0a09', border: `1px solid ${CU.border}` }} />
                  </div>
                </div>
                <button type="submit" className="w-full text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${CU.accent}, ${CU.accentDark})` }}>
                  <PlusCircle size={14} /> Add Component
                </button>
              </form>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Recipe Components</h4>
                <div className="rounded-2xl overflow-hidden max-h-60 overflow-y-auto" style={{ border:`1px solid ${CU.border}` }}>
                  <table className="w-full text-left text-xs">
                    <thead className="font-bold uppercase" style={{ background:'rgba(184,115,51,0.08)', color:'#78716c', borderBottom:`1px solid ${CU.border}` }}>
                      <tr>
                        <th className="px-4 py-3">Material Component</th>
                        <th className="px-4 py-3 text-center">Qty Needed</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bomItems.map((item) => (
                        <tr key={item.id} className="transition-colors" style={{ borderBottom:`1px solid rgba(184,115,51,0.06)` }}>
                          <td className="px-4 py-3 font-semibold text-stone-300">{getProductName(item.material_product_id)}</td>
                          <td className="px-4 py-3 font-bold text-center" style={{ color: CU.accentLight }}>{item.quantity_required}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDeleteBOMItem(item.id)} className="text-stone-600 hover:text-rose-400 p-1 rounded transition-colors"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                      {bomItems.length === 0 && (
                        <tr><td colSpan="3" className="py-8 text-center text-stone-600 italic">No ingredients defined.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WareProduct;
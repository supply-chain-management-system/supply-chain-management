import React, { useEffect, useState } from "react";
import { 
  ArrowLeftRight, 
  Package, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ChevronDown
} from "lucide-react";
import api from "../../api/api";

function StockUpdatePage() {
  const [products, setProducts] = useState([]);
  const [racks, setRacks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    rack_id: "",
    quantity: "",
    type: "IN",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [p, r] = await Promise.all([
        api.get("/ware_products"),
        api.get("/racks")
      ]);
      setProducts(p.data);
      setRacks(r.data);
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/inventory", form);
      
      alert("Stock updated successfully ✅");

      setForm({
        product_id: "",
        rack_id: "",
        quantity: "",
        type: "IN",
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Error updating stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0c0a09' }}>
      <div className="w-full max-w-xl">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl mb-4" style={{ background: '#1c1410', border: '1px solid rgba(184,115,51,0.2)' }}>
            <ArrowLeftRight style={{ color: '#b87333' }} size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Stock Movement</h1>
          <p className="text-stone-500 font-medium mt-2">Log inbound or outbound stock transactions.</p>
        </div>

        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ background: '#1c1410', border: '1px solid rgba(184,115,51,0.2)' }}>
          
          {/* VISUAL INDICATOR BAR */}
          <div className={`h-1.5 w-full transition-colors duration-500 ${
            form.type === "IN" ? "bg-emerald-500" : "bg-rose-500"
          }`} />
          {/* Copper accent line */}
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #b87333, #d4956a, #b87333)' }} />

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
            
            {/* PRODUCT SELECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest ml-1">
                Product to Move
              </label>
              <div className="relative group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={20} />
                <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}
                  className="w-full pl-12 pr-10 py-4 rounded-2xl outline-none text-sm font-bold text-white appearance-none"
                  style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.2)' }} required>
                  <option value="" className="bg-stone-950">Select a product from catalog</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-stone-950">
                      {p.name} ({p.type === "raw_material" ? "Material" : "Product"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none" size={16} />
              </div>
            </div>

            {/* RACK SELECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest ml-1">
                Target Storage Rack
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={20} />
                <select value={form.rack_id} onChange={(e) => setForm({ ...form, rack_id: Number(e.target.value) })}
                  className="w-full pl-12 pr-10 py-4 rounded-2xl outline-none text-sm font-bold text-white appearance-none"
                  style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.2)' }} required>
                  <option value="" className="bg-stone-950">Choose target rack</option>
                  {racks.map((r) => (
                    <option key={r.id} value={r.id} className="bg-stone-950">{r.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QUANTITY */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest ml-1">Quantity</label>
                <input type="number" placeholder="0.00" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className="w-full px-5 py-4 rounded-2xl outline-none text-sm font-black text-white"
                  style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.2)' }} required />
              </div>

              {/* MOVEMENT TYPE */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-widest ml-1">Operation</label>
                <div className="flex p-1 rounded-2xl" style={{ background: '#0c0a09', border: '1px solid rgba(184,115,51,0.15)' }}>
                  <button type="button" onClick={() => setForm({ ...form, type: "IN" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                      form.type === "IN" ? "text-emerald-400 shadow-sm" : "text-stone-500 hover:text-stone-300"
                    }`}
                    style={form.type === "IN" ? { background: '#1c1410', border: '1px solid rgba(16,185,129,0.2)' } : {}}>
                    <TrendingUp size={14} /> IN
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, type: "OUT" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                      form.type === "OUT" ? "text-rose-400 shadow-sm" : "text-stone-500 hover:text-stone-300"
                    }`}
                    style={form.type === "OUT" ? { background: '#1c1410', border: '1px solid rgba(244,63,94,0.2)' } : {}}>
                    <TrendingDown size={14} /> OUT
                  </button>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-lg flex items-center justify-center gap-3 ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1"
              }`}
              style={{ background: isSubmitting ? '#4a3520' : 'linear-gradient(135deg, #b87333, #8b5a2b)' }}>
              {isSubmitting ? "Processing..." : (
                <><CheckCircle2 size={20} /> Execute Transaction</>
              )}
            </button>

            {/* FOOTER NOTE */}
            <p className="text-center text-[10px] text-stone-600 font-medium">
              Transactions are logged with a timestamp and user ID.
              <br />Please verify all quantities before clicking execute.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StockUpdatePage;
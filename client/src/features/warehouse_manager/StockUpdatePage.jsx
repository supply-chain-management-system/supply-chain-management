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
      // Note: Updated to use your 'api' instance for consistent headers/base URL
      await api.post("/inventory/update", form);
      
      // Using a modern notification approach could replace standard alerts
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
    <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
            <ArrowLeftRight className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Movement</h1>
          <p className="text-slate-500 font-medium mt-2">Log inbound or outbound stock transactions.</p>
        </div>

        {/* MAIN ACTION CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* VISUAL INDICATOR BAR */}
          <div className={`h-2 w-full transition-colors duration-500 ${
            form.type === "IN" ? "bg-emerald-500" : "bg-rose-500"
          }`} />

          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
            
            {/* PRODUCT SELECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Product to Move
              </label>
              <div className="relative group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <select
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: Number(e.target.value) })}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-slate-700 appearance-none"
                  required
                >
                  <option value="">Select a product from catalog</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* RACK SELECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Target Storage Rack
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <select
                  value={form.rack_id}
                  onChange={(e) => setForm({ ...form, rack_id: Number(e.target.value) })}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-bold text-slate-700 appearance-none"
                  required
                >
                  <option value="">Choose target rack</option>
                  {racks.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QUANTITY */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Quantity
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-black text-slate-700"
                  required
                />
              </div>

              {/* MOVEMENT TYPE */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Operation
                </label>
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "IN" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                      form.type === "IN" 
                      ? "bg-white text-emerald-600 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <TrendingUp size={14} /> IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "OUT" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                      form.type === "OUT" 
                      ? "bg-white text-rose-600 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <TrendingDown size={14} /> OUT
                  </button>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-white transition-all shadow-lg flex items-center justify-center gap-3 ${
                isSubmitting ? "bg-slate-400" : "bg-slate-900 hover:bg-black hover:-translate-y-1"
              }`}
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Execute Transaction
                </>
              )}
            </button>

            {/* FOOTER NOTE */}
            <p className="text-center text-[10px] text-slate-400 font-medium">
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
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertTriangle, 
  Activity,
  Calendar,
  DollarSign,
  Package,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1212] border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
        <p className="font-semibold text-white mb-1.5">Date: {label}</p>
        {payload.map((p, idx) => (
          <p key={idx} className="font-semibold text-rose-400">
            {p.name}: <span>₹{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SupplierELT() {
  const user = useSelector((state) => state.auth.user);
  const tenantId = user?.schema_name || "t_yack_09bd7";

  const [overview, setOverview] = useState({
    total_suppliers: 0,
    total_orders: 0,
    total_spend: 0,
    low_stock_materials: 0,
  });
  const [spendHistory, setSpendHistory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);

  const [dateRange, setDateRange] = useState("7d"); // "today", "7d", "30d", "custom"
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Search filter states
  const [supplierSearch, setSupplierSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      let params = `?range=${dateRange}`;
      if (dateRange === "custom" && customDates.start) {
        params += `&start_date=${customDates.start}&end_date=${customDates.end}`;
      }

      const [overRes, spendRes, suppRes, invRes, ordRes] = await Promise.all([
        api.get(`elt/elt_supplier/overview/${tenantId}${params}`).catch(() => ({ data: null })),
        api.get(`elt/elt_supplier/spend-history/${tenantId}${params}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_supplier/suppliers/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_supplier/inventory/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_supplier/orders/${tenantId}`).catch(() => ({ data: [] })),
      ]);

      if (overRes.data) setOverview(overRes.data);
      setSpendHistory(spendRes.data || []);
      setSuppliers(suppRes.data || []);
      setInventory(invRes.data || []);
      setOrders(ordRes.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch ELT supplier metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, dateRange, customDates]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Transform spend history for recharts
  const chartData = spendHistory.map((item) => ({
    date: item.day.substring(0, 10),
    Spend: item.total_spend,
  }));

  const kpis = [
    { 
      label: "Active Suppliers", 
      value: overview.total_suppliers, 
      sub: "Active partners", 
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20" 
    },
    { 
      label: "Total Orders", 
      value: overview.total_orders, 
      sub: "CDC events counted", 
      icon: ShoppingCart, 
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20" 
    },
    { 
      label: "Total Spend", 
      value: `₹${Math.round(overview.total_spend).toLocaleString()}`, 
      sub: "Excluding cancelled orders", 
      icon: DollarSign, 
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
    },
    { 
      label: "Low Stock Materials", 
      value: overview.low_stock_materials, 
      sub: "Requires reordering", 
      icon: AlertTriangle, 
      color: "text-red-500 bg-red-500/10 border-red-500/20" 
    },
  ];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "suppliers", label: "Supplier Register" },
    { key: "inventory", label: "Materials Inventory" },
    { key: "orders", label: "Purchase Orders Logs" },
  ];

  // Filters
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || 
    s.category.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredInventory = inventory.filter(i => 
    i.material_name.toLowerCase().includes(materialSearch.toLowerCase()) || 
    i.category.toLowerCase().includes(materialSearch.toLowerCase()) ||
    i.supplier_name.toLowerCase().includes(materialSearch.toLowerCase())
  );

  return (
    <div className="text-white min-h-screen bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="w-2.5 h-6 rounded bg-gradient-to-b from-red-600 to-rose-500 inline-block"></span>
            Supplier Real-Time ELT Analytics
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Live CDC streams from PostgreSQL to ClickHouse measuring procurement operations
          </p>
        </div>

        {/* Date Filter & Status */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1 shadow-2xl">
            {[
              { key: "today", label: "Today" },
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "custom", label: "Custom" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateRange(opt.key)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  dateRange === opt.key
                    ? "bg-white/10 text-white shadow-inner border border-white/10"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {dateRange === "custom" && (
            <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent border-none text-white focus:outline-none"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent border-none text-white focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs">
            {lastUpdated && (
              <span className="text-gray-500">
                Synced {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              CDC Pipeline Active
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-rose-500/25 border-t-rose-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">Connecting to analytical pipeline...</p>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-black text-white">{kpi.value}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{kpi.sub}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${kpi.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#150e0e]/60 border border-white/5 rounded-2xl overflow-hidden shadow-2xl mb-10">
            <div className="border-b border-white/5 bg-black/20 px-6 py-4">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-white/10 text-white shadow-inner border border-white/10"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-10">
                  {/* Spend History Area Chart */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <TrendingUp size={16} className="text-rose-500" />
                          Spend Ingestion Trends
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Daily purchase order transaction volumes transformed in real-time
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 uppercase tracking-wider">
                        Procurement History
                      </span>
                    </div>

                    <div style={{ width: "100%", height: 300 }}>
                      {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">
                          No spend history transactions captured in this date range.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <defs>
                              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fill: "#6b7280" }}
                              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 10, fill: "#6b7280" }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                              type="monotone"
                              dataKey="Spend"
                              stroke="#f43f5e"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#spendGrad)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Summary of tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Material Shortage Alerts */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-500" />
                        Critical Material Stock Alerts
                      </h3>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {inventory.filter(i => i.quantity <= i.min_threshold).length === 0 ? (
                          <div className="py-6 text-center text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            All materials stock values are healthy!
                          </div>
                        ) : (
                          inventory.filter(i => i.quantity <= i.min_threshold).map((m) => (
                            <div key={m.id} className="bg-red-500/5 rounded-xl p-4 border border-red-500/10 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-white block">{m.material_name}</span>
                                <span className="text-[10px] text-gray-500 mt-0.5 block">Supplier: {m.supplier_name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-red-400 font-bold block">{m.quantity} / {m.min_threshold} {m.unit}</span>
                                <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider mt-1 block">Low Stock</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Quick Purchase Orders */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <ShoppingCart size={16} className="text-purple-500" />
                        Recent Purchase Orders
                      </h3>
                      <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto pr-1">
                        {orders.length === 0 ? (
                          <p className="text-xs text-gray-500 py-4 text-center">No transactions captured.</p>
                        ) : (
                          orders.slice(0, 5).map((o) => {
                            const statusColor = 
                              o.status === "received" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                              o.status === "sent" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" :
                              o.status === "cancelled" ? "text-gray-400 bg-white/5 border-white/10" :
                              "text-amber-400 bg-amber-500/10 border-amber-500/20";
                            return (
                              <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-semibold text-white block">{o.material_name} ({o.quantity} {o.unit})</span>
                                  <span className="text-[9px] text-gray-500 mt-1 block">Supplier: {o.supplier_name}</span>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${statusColor}`}>
                                    {o.status}
                                  </span>
                                  <span className="font-bold text-white">₹{o.total_amount.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Suppliers Tab */}
              {activeTab === "suppliers" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="relative w-80">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        className="bg-white/5 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500 w-full"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/10">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Lead Time</th>
                          <th className="p-4">Rating</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredSuppliers.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-gray-500">
                              No suppliers ingested or matched the search.
                            </td>
                          </tr>
                        ) : (
                          filteredSuppliers.map((s) => (
                            <tr key={s.id} className="hover:bg-white/[0.01] transition-all">
                              <td className="p-4 font-bold text-white">{s.name}</td>
                              <td className="p-4 text-gray-300">{s.category}</td>
                              <td className="p-4">
                                <span className="block text-gray-300">{s.contact_email}</span>
                                <span className="text-[10px] text-gray-500 block mt-0.5">{s.phone || '—'}</span>
                              </td>
                              <td className="p-4 text-gray-300">{s.lead_time_days} days</td>
                              <td className="p-4 text-rose-400 font-bold">★ {s.rating.toFixed(1)}</td>
                              <td className="p-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  s.is_active 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                  {s.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Inventory Tab */}
              {activeTab === "inventory" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="relative w-80">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search materials, category, or supplier..."
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        className="bg-white/5 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500 w-full"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/10">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Material</th>
                          <th className="p-4">Category</th>
                          <th className="p-4 text-right">Current Stock</th>
                          <th className="p-4 text-right">Reorder Threshold</th>
                          <th className="p-4">Supplier</th>
                          <th className="p-4 text-center">Alert Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredInventory.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-gray-500">
                              No raw material inventory data found.
                            </td>
                          </tr>
                        ) : (
                          filteredInventory.map((i) => {
                            const isLow = i.quantity <= i.min_threshold;
                            return (
                              <tr key={i.id} className="hover:bg-white/[0.01] transition-all">
                                <td className="p-4 font-bold text-white">{i.material_name}</td>
                                <td className="p-4 text-gray-300">{i.category}</td>
                                <td className="p-4 text-right font-bold text-white">{i.quantity} {i.unit}</td>
                                <td className="p-4 text-right text-gray-400">{i.min_threshold} {i.unit}</td>
                                <td className="p-4 text-gray-300 font-medium">{i.supplier_name}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                    isLow 
                                      ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  }`}>
                                    {isLow ? "Low Stock" : "Healthy"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/10">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">PO Code</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Supplier</th>
                          <th className="p-4">Item details</th>
                          <th className="p-4 text-right">Cost</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-gray-500">
                              No purchase order events captured.
                            </td>
                          </tr>
                        ) : (
                          orders.map((o) => {
                            const statusColor = 
                              o.status === "received" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              o.status === "sent" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              o.status === "cancelled" ? "bg-white/5 text-gray-400 border-white/10" :
                              "bg-amber-500/10 text-amber-400 border-amber-500/20";
                            return (
                              <tr key={o.id} className="hover:bg-white/[0.01] transition-all">
                                <td className="p-4 font-mono font-bold text-gray-400">PO-{String(o.id).padStart(5, '0')}</td>
                                <td className="p-4 text-gray-300">{new Date(o.order_date).toLocaleDateString()}</td>
                                <td className="p-4 text-white font-medium">{o.supplier_name}</td>
                                <td className="p-4">
                                  <span className="block text-white font-bold">{o.material_name}</span>
                                  <span className="text-[10px] text-gray-500 block mt-0.5">
                                    {o.quantity} {o.unit} @ ₹{o.unit_price}/{o.unit}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-bold text-white">₹{o.total_amount.toLocaleString()}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${statusColor}`}>
                                    {o.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

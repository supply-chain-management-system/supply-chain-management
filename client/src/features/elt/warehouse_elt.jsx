import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { 
  Building2, 
  Layers, 
  Boxes, 
  AlertTriangle, 
  Search, 
  RefreshCw,
  Activity,
  ChevronRight
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const LINE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#3b82f6"];

export default function WarehouseELT() {
  const user = useSelector((state) => state.auth.user);
  const tenantId = user?.schema_name || "t_yack_09bd7";

  const [warehouses, setWarehouses] = useState([]);
  const [racks, setRacks] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [overview, setOverview] = useState({
    total_warehouses: 0,
    total_racks: 0,
    total_stock: 0,
    low_stock_items: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      const [whRes, rackRes, prodRes, invRes, overRes, histRes] = await Promise.all([
        api.get(`elt/elt_warehouse/warehouses/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_warehouse/racks/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_warehouse/products/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_warehouse/inventory/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_warehouse/overview/${tenantId}`).catch(() => ({ data: null })),
        api.get(`elt/elt_warehouse/stock-history/${tenantId}`).catch(() => ({ data: [] })),
      ]);

      setWarehouses(whRes.data || []);
      setRacks(rackRes.data || []);
      setProducts(prodRes.data || []);
      setInventory(invRes.data || []);
      if (overRes.data) setOverview(overRes.data);
      setStockHistory(histRes.data || []);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch Warehouse ELT analytical data:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Transform historical data for Recharts LineChart
  const timeLabels = Array.from(new Set((stockHistory || []).map(h => h.processed_at.substring(0, 16)))).sort();
  const lineChartData = timeLabels.map(timeLabel => {
    const point = { timeLabel: timeLabel.split(" ")[1] || timeLabel }; // just the time HH:MM
    // Get records at this exact timestamp
    const records = (stockHistory || []).filter(h => h.processed_at.startsWith(timeLabel));
    records.forEach(r => {
      point[r.product_name] = r.quantity;
    });
    return point;
  });

  const uniqueProductNames = Array.from(new Set((stockHistory || []).map(h => h.product_name)));

  // Transform inventory data for BarChart (Quantity per Product)
  const barChartData = Object.values(
    (inventory || []).reduce((acc, item) => {
      if (!acc[item.product_name]) {
        acc[item.product_name] = { name: item.product_name, Stock: 0 };
      }
      acc[item.product_name].Stock += item.quantity;
      return acc;
    }, {})
  );

  const kpis = [
    { label: "Total Warehouses", value: overview.total_warehouses, sub: `${warehouses.length} registered`, icon: <Building2 className="w-5 h-5 text-indigo-600" /> },
    { label: "Active Racks", value: overview.total_racks, sub: `${racks.length} mapped`, icon: <Layers className="w-5 h-5 text-emerald-600" /> },
    { label: "Total Stock Volume", value: overview.total_stock.toLocaleString(), sub: "Units in storage", icon: <Boxes className="w-5 h-5 text-blue-600" /> },
    { label: "Low Stock Alerts", value: overview.low_stock_items, sub: "Below 20 units threshold", icon: <AlertTriangle className="w-5 h-5 text-rose-600" />, isAlert: overview.low_stock_items > 0 },
  ];

  const filteredInventory = inventory.filter(item => 
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rack_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Real-time Stock Movement Chart */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Stock Levels Over Time</h3>
              <p className="text-xs text-gray-500 mt-0.5">Real-time CDC updates of inventory adjustments</p>
            </div>
            <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Live Stream
            </span>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            {lineChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                No stock movement events recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
                  {uniqueProductNames.map((name, idx) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stock Distribution by Product Chart */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Current Stock by Product</h3>
              <p className="text-xs text-gray-500 mt-0.5">Aggregated warehouse storage distribution</p>
            </div>
            <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200">
              Bar Chart
            </span>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            {barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                No inventory distribution data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Warehouse Quick list */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Monitored Facilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map(w => (
            <div key={w.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Warehouse #{w.id}</span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">{w.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{w.location || "No location set"}</p>
              </div>
              <Building2 className="w-8 h-8 text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWarehouseTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Warehouses list */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Warehouse Locations</h3>
        <div className="space-y-4">
          {warehouses.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No warehouses registered.</p>
          ) : (
            warehouses.map(w => (
              <div key={w.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{w.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{w.location || "N/A"}</p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                  Active CDC
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Racks list */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Rack Configuration Map</h3>
        <div className="space-y-4">
          {racks.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No racks mapped in ClickHouse.</p>
          ) : (
            racks.map(r => (
              <div key={r.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{r.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Assigned to: <span className="font-semibold text-gray-700">{r.warehouse_name}</span></p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                  ID-{r.id}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-6">
      {/* Search & Statistics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product, warehouse or rack..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Rack Location</th>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-xs text-gray-400 italic">
                    No matching inventory items found in ClickHouse.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isLow = item.quantity < 20;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{item.product_name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-700">
                          {item.rack_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.warehouse_name}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                          isLow 
                            ? "bg-rose-50 text-rose-700 border border-rose-100" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
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
    </div>
  );

  const renderProductsTab = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Product Catalog</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <p className="text-xs text-gray-400 italic col-span-full">No products registered in the ClickHouse catalog.</p>
        ) : (
          products.map(p => (
            <div key={p.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">{p.name}</h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5 uppercase">SKU: {p.sku || "N/A"}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Warehouse ELT Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time PostgreSQL CDC logs extracted, loaded, and transformed directly into ClickHouse
            </p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin text-gray-400" /> Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              CDC Pipeline Active
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Querying ClickHouse analytical data warehouses...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1.5">{kpi.value}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">{kpi.sub}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-white border border-gray-100 shadow-sm ${kpi.isAlert ? 'animate-bounce' : ''}`}>
                    {kpi.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
                <div className="flex gap-2 overflow-x-auto">
                  {[
                    { key: "overview", label: "Overview" },
                    { key: "warehouse", label: "Facility Map" },
                    { key: "inventory", label: "Inventory Levels" },
                    { key: "products", label: "Product Catalog" }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        activeTab === tab.key
                          ? "bg-gray-900 text-white shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content Panels */}
              <div className="p-6">
                {activeTab === "overview" && renderOverviewTab()}
                {activeTab === "warehouse" && renderWarehouseTab()}
                {activeTab === "inventory" && renderInventoryTab()}
                {activeTab === "products" && renderProductsTab()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

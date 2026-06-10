import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { 
  Truck, 
  MapPin, 
  Package, 
  AlertTriangle, 
  Search, 
  RefreshCw,
  Activity,
  Fuel,
  Compass,
  CheckCircle2
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

const STATUS_COLORS = {
  "Delivered": "#10b981",
  "In Transit": "#3b82f6",
  "Pending": "#f59e0b",
  "Delayed": "#ef4444"
};

export default function LogisticsELT() {
  const user = useSelector((state) => state.auth.user);
  const tenantId = user?.schema_name || "t_yack_09bd7";

  const [vehicles, setVehicles] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [overview, setOverview] = useState({
    active_vehicles: 0,
    deliveries_today: 0,
    pending_shipments: 0,
    critical_alerts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      const [vhRes, shpRes, actRes, overRes, histRes] = await Promise.all([
        api.get(`elt/elt_logistics/vehicles/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_logistics/shipments/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_logistics/activities/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_logistics/overview/${tenantId}`).catch(() => ({ data: null })),
        api.get(`elt/elt_logistics/shipment-history/${tenantId}`).catch(() => ({ data: [] })),
      ]);

      setVehicles(vhRes.data || []);
      setShipments(shpRes.data || []);
      setActivities(actRes.data || []);
      if (overRes.data) setOverview(overRes.data);
      setStockHistory(histRes.data || []);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch Logistics ELT analytical data:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Format historical data for Recharts LineChart
  const timeLabels = Array.from(new Set((stockHistory || []).map(h => h.day))).sort();
  const lineChartData = timeLabels.map(day => {
    const point = { day: day.substring(5, 10) }; // MM-DD
    const dayRecords = (stockHistory || []).filter(h => h.day === day);
    dayRecords.forEach(r => {
      point[r.status] = r.count;
    });
    return point;
  });

  const statuses = Array.from(new Set((stockHistory || []).map(h => h.status)));

  // Format fuel & capacity data for active fleet
  const vehicleChartData = vehicles.map(v => ({
    name: v.fleet_id,
    Fuel: v.fuel_level,
    Capacity: v.capacity_kg
  }));

  const kpis = [
    { label: "Active Fleet", value: overview.active_vehicles, sub: `${vehicles.length} registered`, icon: <Truck className="w-5 h-5 text-indigo-600" /> },
    { label: "Deliveries Completed", value: overview.deliveries_today, sub: "Delivered status", icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
    { label: "Pending Shipments", value: overview.pending_shipments, sub: "In queue/transit", icon: <Package className="w-5 h-5 text-blue-600" /> },
    { label: "Logistics Alerts", value: overview.critical_alerts, sub: "Critical activities", icon: <AlertTriangle className="w-5 h-5 text-rose-600" />, isAlert: overview.critical_alerts > 0 },
  ];

  const filteredShipments = shipments.filter(ship => 
    ship.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeStyle = (status) => {
    const s = status || "Pending";
    if (s === "Delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "In Transit") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "Delayed") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Shipment History Chart */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Shipment Status Over Time</h3>
              <p className="text-xs text-gray-500 mt-0.5">Historical overview of deliveries</p>
            </div>
            <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Live Stream
            </span>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            {lineChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                No historical shipment statuses found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
                  {statuses.map(status => (
                    <Line
                      key={status}
                      type="monotone"
                      dataKey={status}
                      stroke={STATUS_COLORS[status] || "#9ca3af"}
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

        {/* Fleet Fuel Level Analytics */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Fleet Fuel Tracking</h3>
              <p className="text-xs text-gray-500 mt-0.5">Real-time fuel levels (%) per vehicle ID</p>
            </div>
            <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200">
              Fuel Levels
            </span>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            {vehicleChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                No active fleet telemetry registered.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="Fuel" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs (CDC stream list) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 text-green-500" /> Logistics CDC Activity Feed
        </h3>
        <div className="divide-y divide-gray-100 overflow-y-auto max-h-[300px] pr-2">
          {activities.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4">No recent activity logged in ClickHouse.</p>
          ) : (
            activities.map(a => {
              const isError = a.status_type === "error";
              const isWarning = a.status_type === "warning";
              const isSuccess = a.status_type === "success";

              let dotColor = "bg-blue-400";
              if (isError) dotColor = "bg-red-500 animate-pulse";
              else if (isWarning) dotColor = "bg-amber-400";
              else if (isSuccess) dotColor = "bg-green-500";

              return (
                <div key={a.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="text-gray-800 font-medium">{a.event_text}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-[10px]">{a.event_time}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderFleetTab = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Fleet ID</th>
              <th className="px-6 py-4">Driver</th>
              <th className="px-6 py-4">Vehicle Type</th>
              <th className="px-6 py-4">Current Station</th>
              <th className="px-6 py-4">Capacity</th>
              <th className="px-6 py-4">Fuel level</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-xs text-gray-400 italic">
                  No fleet vehicles mapped in ClickHouse.
                </td>
              </tr>
            ) : (
              vehicles.map(v => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 font-mono">{v.fleet_id}</td>
                  <td className="px-6 py-4 text-gray-700">{v.driver_name || "Unassigned"}</td>
                  <td className="px-6 py-4 text-gray-600">{v.vehicle_type}</td>
                  <td className="px-6 py-4 text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {v.stop_warehouse_name || "Transit"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{v.capacity_kg} kg</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-3.5 h-3.5 text-amber-500" />
                      <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${v.fuel_level < 20 ? 'bg-red-500' : v.fuel_level < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${v.fuel_level}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold font-mono text-gray-700">{v.fuel_level}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                      v.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                      v.status === 'Maintenance' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderShipmentsTab = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search shipments by tracker, destination or driver..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Tracking Number</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4">ETA</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-xs text-gray-400 italic">
                    No matching shipments found in ClickHouse.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">{item.tracking_number}</td>
                    <td className="px-6 py-4 text-gray-700">{item.destination}</td>
                    <td className="px-6 py-4 text-gray-600">{item.driver_name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.weight_kg} kg</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{item.eta || "N/A"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              Logistics ELT Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time fleet operations and shipment movements synchronizing directly to ClickHouse
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
                    { key: "fleet", label: "Fleet Telemetry" },
                    { key: "shipments", label: "Shipment Ledger" }
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
                {activeTab === "fleet" && renderFleetTab()}
                {activeTab === "shipments" && renderShipmentsTab()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

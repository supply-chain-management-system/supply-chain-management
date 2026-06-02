import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";

import EfficiencyChart from "./component/EfficiencyChart";
import TargetVsOutputChart from "./component/TargetVsOutputChart";
import StatusChart from "./component/StatusChart";
import TableView from "./component/TableView";
import ProductDetails from "./component/ProductDetailsels";
import WorkerThroughputChart from "./component/WorkerThroughputChart";

export default function ProductionELT() {
  const user = useSelector((state) => state.auth.user);
  const tenantId = user?.schema_name || "t_yack_09bd7";

  const [data, setData] = useState([]); // production jobs
  const [overview, setOverview] = useState({
    active_jobs: 0,
    total_machines: 0,
    active_machines: 0,
    low_stock_materials: 0,
    total_workers: 0,
  });
  const [machines, setMachines] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [dateRange, setDateRange] = useState("7d"); // "today", "7d", "30d", "custom"
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    try {
      let params = `?range=${dateRange}`;
      if (dateRange === "custom" && customDates.start) {
        params += `&start_date=${customDates.start}&end_date=${customDates.end}`;
      }

      const [prodRes, overRes, machRes, matRes, txRes, workRes, teamRes] = await Promise.all([
        api.get(`elt/elt_production/production/${tenantId}${params}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_production/overview/${tenantId}${params}`).catch(() => ({ data: null })),
        api.get(`elt/elt_production/machines/${tenantId}${params}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_production/materials/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_production/transactions/${tenantId}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_production/workers/${tenantId}${params}`).catch(() => ({ data: [] })),
        api.get(`elt/elt_production/teams/${tenantId}`).catch(() => ({ data: [] })),
      ]);

      setData(prodRes.data || []);
      if (overRes.data) setOverview(overRes.data);
      setMachines(machRes.data || []);
      setMaterials(matRes.data || []);
      setTransactions(txRes.data || []);
      setWorkers(workRes.data || []);
      setTeams(teamRes.data || []);
      
      console.log("=== FACTORY ELT BACKEND RESPONSES ===");
      console.log("Production Jobs:", prodRes.data);
      console.log("Overview Summary:", overRes.data);
      console.log("Machines:", machRes.data);
      console.log("Materials:", matRes.data);
      console.log("Transactions:", txRes.data);
      console.log("Workers:", workRes.data);
      console.log("Teams:", teamRes.data);
      console.log("=====================================");

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch ELT analytical data:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, dateRange, customDates]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Group by product name and get the latest day's state
  const latestProducts = Object.values(
    data.reduce((acc, d) => {
      const prev = acc[d.product_name];
      if (!prev || d.day > prev.day) {
        acc[d.product_name] = d;
      }
      return acc;
    }, {})
  );

  // Group machines by ID and summarize historical status counts
  const aggregatedMachines = Object.values(
    machines.reduce((acc, m) => {
      if (!acc[m.id]) {
        acc[m.id] = { id: m.id, name: m.name, latestStatus: m.status, history: {} };
      }
      acc[m.id].history[m.status] = (acc[m.id].history[m.status] || 0) + m.count;
      acc[m.id].latestStatus = m.status;
      return acc;
    }, {})
  );

  // Group workers by ID and calculate total throughput over time
  const aggregatedWorkers = Object.values(
    workers.reduce((acc, w) => {
      if (!acc[w.id]) {
        acc[w.id] = { id: w.id, name: w.name, totalThroughput: 0, history: [] };
      }
      acc[w.id].totalThroughput += w.throughput;
      acc[w.id].history.push(w);
      return acc;
    }, {})
  );

  // Compute overall production metrics
  const totalProducts = latestProducts.length;
  const avgEfficiency = totalProducts > 0
    ? (latestProducts.reduce((sum, d) => sum + (parseFloat(d.efficiency) || 0), 0) / totalProducts).toFixed(1)
    : "0.0";
  const totalOutput = latestProducts.reduce((sum, d) => sum + (d.output_qty || 0), 0);
  const totalTarget = latestProducts.reduce((sum, d) => sum + (d.target_qty || 0), 0);
  const completedCount = latestProducts.filter(d => d.status?.toLowerCase() === "completed").length;
  const inProgressCount = latestProducts.filter(d => d.status?.toLowerCase() === "progress").length;

  const kpis = [
    { label: "Active Jobs", value: overview.active_jobs, sub: `${totalProducts} Total Jobs`, icon: "📦" },
    { label: "Avg Efficiency", value: `${avgEfficiency}%`, sub: `Overall performance`, icon: "⚡" },
    { label: "Machines Status", value: `${overview.active_machines}/${overview.total_machines}`, sub: "Machines Active", icon: "⚙️" },
    { label: "Low Stock Items", value: overview.low_stock_materials, sub: `${materials.length} Raw Materials`, icon: "🚨" },
  ];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "production", label: "Production Jobs" },
    { key: "machines", label: "Machines" },
    { key: "materials", label: "Materials & Stock" },
    { key: "workforce", label: "Workforce & Teams" },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Target Progress Bar */}
      {totalTarget > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Overall Pipeline Progress</p>
            <p className="text-sm font-semibold text-gray-900">
              {totalOutput.toLocaleString()} <span className="text-gray-400 font-normal">/ {totalTarget.toLocaleString()} units</span>
            </p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(Math.round((totalOutput / totalTarget) * 100), 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Completed: {completedCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              In Progress: {inProgressCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Pending: {totalProducts - completedCount - inProgressCount}
            </span>
          </div>
        </div>
      )}

      {/* Production Analytical Charts */}
      {data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EfficiencyChart data={data} range={dateRange} />
          <TargetVsOutputChart data={data} />
          <WorkerThroughputChart data={workers} />
          <StatusChart data={machines} />
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm">No production jobs found. Create some in the production manager page to see analytics.</p>
        </div>
      )}
    </div>
  );

  const renderProductionTab = () => (
    <div className="space-y-6">
      {latestProducts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No production data yet</h3>
          <p className="text-xs text-gray-500">
            Data will appear here once the ELT pipeline begins processing events.
          </p>
        </div>
      ) : (
        <TableView data={latestProducts} onSelect={setSelectedProduct} />
      )}
    </div>
  );

  const renderMachinesTab = () => (
    <div className="space-y-6">
      {aggregatedMachines.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm">No machines monitored by the ELT pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aggregatedMachines.map((m) => {
            const statusColors = 
              m.latestStatus === "active" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
              m.latestStatus === "maintenance" ? "text-amber-700 bg-amber-50 border-amber-200" :
              "text-blue-700 bg-blue-50 border-blue-200";

            return (
              <div key={m.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 font-mono">MC-{String(m.id).padStart(4, '0')}</span>
                    <h4 className="text-sm font-semibold text-gray-900 mt-1">{m.name}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors} capitalize`}>
                    Latest: {m.latestStatus || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-2 mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Historical Event Count</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {Object.entries(m.history).map(([status, count]) => (
                      <div key={status} className="flex justify-between bg-white px-2 py-1 rounded border border-gray-50">
                        <span className="capitalize font-medium">{status}:</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMaterialsTab = () => (
    <div className="space-y-8">
      {materials.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm">No raw materials tracked by the ELT pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Materials List */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Materials Stock Levels</h3>
            <div className="space-y-4">
              {materials.map((m) => {
                const isLow = m.is_low_stock || m.current_stock <= m.low_stock_threshold;
                const pct = Math.min(100, Math.round((m.current_stock / Math.max(1, m.low_stock_threshold * 3)) * 100));
                const progressColor = isLow ? "bg-red-500" : "bg-emerald-500";

                return (
                  <div key={m.id} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{m.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Threshold: {m.low_stock_threshold} {m.unit}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                          {m.current_stock} {m.unit}
                        </span>
                        {isLow && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
                            Low Stock
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Stock Ledger Logs (CDC stream)</h3>
            <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-200 pr-1">
              {transactions.length === 0 ? (
                <p className="text-xs text-gray-400 py-4">No transactions recorded.</p>
              ) : (
                transactions.map((t) => {
                  const typeColor = t.transaction_type === "RESTOCK" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-blue-700 bg-blue-50 border-blue-100";
                  return (
                    <div key={t.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-gray-900">{t.material_name || `Material #${t.material_id}`}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {t.timestamp ? new Date(t.timestamp).toLocaleString() : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${typeColor}`}>
                          {t.transaction_type}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {t.transaction_type === "RESTOCK" ? "+" : "-"}{t.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWorkforceTab = () => (
    <div className="space-y-8">
      {aggregatedWorkers.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm">No worker information monitored by the ELT pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Worker Throughput Chart */}
          <WorkerThroughputChart data={workers} />

          {/* Team Assignments */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Production Team Allocation</h3>
            <div className="space-y-4">
              {teams.length === 0 ? (
                <p className="text-xs text-gray-400 py-4">No team members assigned.</p>
              ) : (
                teams.map((t) => (
                  <div key={t.id} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-gray-900 block">{t.worker_name || `Worker #${t.worker_id}`}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Assigned Role: <span className="capitalize">{t.role}</span></span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded text-[10px] font-mono">
                        Job: {t.product_name || `Job #${t.production_id}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Detail View for a Product
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelectedProduct(null)}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <ProductDetails product={selectedProduct} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Full Factory ELT Analytics
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Real-time CDCs, event transformations, and logs synced directly to ClickHouse
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 shadow-sm">
              {[
                { key: "today", label: "Today" },
                { key: "7d", label: "7 Days" },
                { key: "30d", label: "30 Days" },
                { key: "custom", label: "Custom" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setDateRange(opt.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dateRange === opt.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {dateRange === "custom" && (
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            )}

            {/* Live indicator */}
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                CDC Active
              </span>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500">Connecting to ClickHouse analytical database...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {kpi.label}
                    </p>
                    <span className="text-base">{kpi.icon}</span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-3">
                <div className="flex gap-1 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        activeTab === tab.key
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {activeTab === "overview" && renderOverviewTab()}
                {activeTab === "production" && renderProductionTab()}
                {activeTab === "machines" && renderMachinesTab()}
                {activeTab === "materials" && renderMaterialsTab()}
                {activeTab === "workforce" && renderWorkforceTab()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState, useCallback } from "react";
import api from "../../api/api";

import EfficiencyChart from "./component/EfficiencyChart";
import TargetVsOutputChart from "./component/TargetVsOutputChart";
import StatusChart from "./component/StatusChart";
import TableView from "./component/TableView";
import ProductDetails from "./component/ProductDetailsels";

export default function ProductionELT() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("elt/elt_production/production/t_yack_09bd7");
      setData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, [fetchData]);

  // Compute KPIs
  const totalProducts = data.length;
  const avgEfficiency = totalProducts > 0
    ? (data.reduce((sum, d) => sum + (parseFloat(d.efficiency) || 0), 0) / totalProducts).toFixed(1)
    : "0.0";
  const totalOutput = data.reduce((sum, d) => sum + (d.output_qty || 0), 0);
  const totalTarget = data.reduce((sum, d) => sum + (d.target_qty || 0), 0);
  const completedCount = data.filter(d => d.status?.toLowerCase() === "completed").length;
  const inProgressCount = data.filter(d => d.status?.toLowerCase() === "progress").length;

  const kpis = [
    { label: "Total Products", value: totalProducts, icon: "📦" },
    { label: "Avg Efficiency", value: `${avgEfficiency}%`, icon: "⚡" },
    { label: "Total Output", value: totalOutput.toLocaleString(), icon: "🏭" },
    { label: "Completion Rate", value: totalProducts > 0 ? `${Math.round((completedCount / totalProducts) * 100)}%` : "0%", icon: "✅" },
  ];

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "table", label: "Data Table" },
    { key: "details", label: "Product Details" },
  ];

  // Product Details view
  if (selected) {
    return (
      <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <ProductDetails product={selected} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Production Analytics
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Real-time ELT pipeline monitoring dashboard
            </p>
          </div>

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
              Live
            </span>
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
              <p className="text-sm text-gray-500">Loading production data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {kpi.label}
                    </p>
                    <span className="text-base">{kpi.icon}</span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Pipeline Status Bar */}
            {totalTarget > 0 && (
              <div className="mb-8 bg-gray-50 rounded-xl border border-gray-100 p-5">
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

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-3">
                <div className="flex gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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

              <div className="p-6">
                {/* Empty state */}
                {data.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No production data yet</h3>
                    <p className="text-xs text-gray-500">
                      Data will appear here once the ELT pipeline begins processing events.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EfficiencyChart data={data} />
                        <TargetVsOutputChart data={data} />
                        <div className="lg:col-span-2">
                          <StatusChart data={data} />
                        </div>
                      </div>
                    )}

                    {/* Table Tab */}
                    {activeTab === "table" && (
                      <TableView data={data} onSelect={setSelected} />
                    )}

                    {/* Details Tab */}
                    {activeTab === "details" && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500 mb-4">
                          Select a product to view detailed history and trends.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {data.map((item, i) => {
                            const eff = parseFloat(item.efficiency) || 0;
                            const statusColor = item.status?.toLowerCase() === "completed"
                              ? "text-emerald-700 bg-emerald-50"
                              : item.status?.toLowerCase() === "progress"
                                ? "text-blue-700 bg-blue-50"
                                : "text-amber-700 bg-amber-50";

                            return (
                              <button
                                key={i}
                                onClick={() => setSelected(item.product_name)}
                                className="text-left bg-gray-50 hover:bg-gray-100 rounded-xl p-4 border border-gray-100 transition-all hover:border-gray-300 group"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-900">
                                    {item.product_name}
                                  </p>
                                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                    {item.status || "Pending"}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {item.output_qty || 0} / {item.target_qty || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gray-900 rounded-full"
                                      style={{ width: `${Math.min(eff, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-500">{eff}%</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
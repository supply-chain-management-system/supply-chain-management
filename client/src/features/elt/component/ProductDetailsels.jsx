import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";
import api from "../../../api/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: "12px",
      }}>
        <p style={{ fontWeight: 600, color: "#111827", marginBottom: "6px" }}>
          {label}
        </p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: "#6b7280", marginBottom: "2px" }}>
            {p.dataKey === "output_qty" ? "Output" : p.dataKey === "target_qty" ? "Target" : p.dataKey}:{" "}
            <span style={{ fontWeight: 600, color: p.color }}>{p.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProductDetails({ product, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`elt/elt_production/production/t_yack_09bd7/history/${product}`)
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [product]);

  // Latest data point
  const latest = history.length > 0 ? history[history.length - 1] : null;

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed") return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (s === "progress") return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-amber-700 bg-amber-50 border-amber-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{product}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Production history &amp; trend analysis
          </p>
        </div>
        {latest && (
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusStyle(latest.status)}`}>
            {latest.status || "Pending"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : history.length === 0 ? (
        <div className="py-16 text-center bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-3xl mb-3">📭</div>
          <p className="text-sm text-gray-500">No history data available for this product.</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Records", value: history.length },
              { label: "Latest Output", value: latest?.output_qty?.toLocaleString() || "0" },
              { label: "Latest Target", value: latest?.target_qty?.toLocaleString() || "0" },
              { label: "Latest Efficiency", value: `${latest?.efficiency || 0}%` },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Output Trend Chart */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Output Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Target vs actual output over time</p>
              </div>
            </div>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#111827" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="created_at"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="target_qty"
                    stroke="#111827"
                    strokeWidth={2}
                    fill="url(#targetGrad)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="output_qty"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#outputGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-3 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-0.5 bg-gray-900 rounded-full inline-block"></span>
                Target
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "#6366f1" }}></span>
                Output
              </span>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Change History</h3>
            </div>

            <div className="overflow-auto">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <div className="col-span-3">Time</div>
                <div className="col-span-2 text-center">Target</div>
                <div className="col-span-2 text-center">Output</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-3 text-center">Efficiency</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-50">
                {history.map((h, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3 items-center hover:bg-gray-50 transition-colors text-sm">
                    <div className="col-span-3 text-gray-500 text-xs font-mono">
                      {h.created_at}
                    </div>
                    <div className="col-span-2 text-center text-gray-600">
                      {(h.target_qty || 0).toLocaleString()}
                    </div>
                    <div className="col-span-2 text-center font-medium text-gray-900">
                      {(h.output_qty || 0).toLocaleString()}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(h.status).replace(" border-emerald-200", "").replace(" border-blue-200", "").replace(" border-amber-200", "")}`}>
                        {h.status || "Pending"}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(parseFloat(h.efficiency) || 0, 100)}%`,
                              background: (parseFloat(h.efficiency) || 0) >= 80 ? "#059669" : (parseFloat(h.efficiency) || 0) >= 50 ? "#d97706" : "#dc2626"
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500 w-10 text-right">
                          {h.efficiency || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
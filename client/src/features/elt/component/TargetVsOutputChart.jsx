import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

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
        <p style={{ fontWeight: 600, color: "#111827", marginBottom: "6px" }}>Date: {label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: "#6b7280", marginBottom: "2px" }}>
            {p.name === "target_qty" ? "Total Target" : "Total Output"}:{" "}
            <span style={{ fontWeight: 600, color: p.color }}>{p.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "12px", marginTop: "4px" }}>
    {payload.map((entry, i) => (
      <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280" }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          background: entry.color, display: "inline-block"
        }} />
        {entry.value === "target_qty" ? "Total Target" : "Total Output"}
      </span>
    ))}
  </div>
);

export default function TargetVsOutputChart({ data }) {
  // Group flat records by 'day' and sum target/output quantities
  const dailyThroughput = Object.values(
    data.reduce((acc, d) => {
      const day = d.day;
      if (!acc[day]) {
        acc[day] = { day, target_qty: 0, output_qty: 0 };
      }
      acc[day].target_qty += d.target_qty || 0;
      acc[day].output_qty += d.output_qty || 0;
      return acc;
    }, {})
  ).sort((a, b) => a.day.localeCompare(b.day));

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Throughput over Time</h3>
          <p className="text-xs text-gray-500 mt-0.5">Total target vs output comparison by day</p>
        </div>
        <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200">
          Comparison
        </span>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyThroughput} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="target_qty" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="output_qty" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
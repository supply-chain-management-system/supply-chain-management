import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
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
        <p style={{ fontWeight: 600, color: "#111827", marginBottom: "4px" }}>{label}</p>
        <p style={{ color: "#6b7280" }}>
          Efficiency: <span style={{ fontWeight: 600, color: "#111827" }}>{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const getBarColor = (value) => {
  if (value >= 80) return "#059669";
  if (value >= 50) return "#d97706";
  return "#dc2626";
};

export default function EfficiencyChart({ data }) {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Efficiency by Product</h3>
          <p className="text-xs text-gray-500 mt-0.5">Production efficiency percentage</p>
        </div>
        <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200">
          Bar Chart
        </span>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="product_name"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="efficiency" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getBarColor(parseFloat(entry.efficiency) || 0)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
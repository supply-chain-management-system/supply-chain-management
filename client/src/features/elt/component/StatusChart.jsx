import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const STATUS_CONFIG = {
  completed: { color: "#059669", bg: "bg-emerald-50", text: "text-emerald-700", label: "Completed" },
  progress:  { color: "#3b82f6", bg: "bg-blue-50",    text: "text-blue-700",    label: "In Progress" },
  pending:   { color: "#d97706", bg: "bg-amber-50",   text: "text-amber-700",   label: "Pending" },
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: "12px",
      }}>
        <p style={{ fontWeight: 600, color: "#111827" }}>
          {entry.name}: <span style={{ color: entry.payload.fill }}>{entry.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function StatusChart({ data }) {
  const grouped = Object.values(
    data.reduce((acc, item) => {
      const key = (item.status || "pending").toLowerCase();
      acc[key] = acc[key] || { name: STATUS_CONFIG[key]?.label || key, value: 0, key };
      acc[key].value++;
      return acc;
    }, {})
  );

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Status Distribution</h3>
          <p className="text-xs text-gray-500 mt-0.5">Production job statuses breakdown</p>
        </div>
        <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200">
          Distribution
        </span>
      </div>

      <div className="flex items-center gap-8">
        {/* Pie Chart */}
        <div style={{ width: 180, height: 180, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={grouped}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                strokeWidth={2}
                stroke="#fff"
              >
                {grouped.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={STATUS_CONFIG[entry.key]?.color || "#9ca3af"}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {grouped.map((entry, i) => {
            const config = STATUS_CONFIG[entry.key] || {};
            const total = grouped.reduce((s, g) => s + g.value, 0);
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;

            return (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: config.color || "#9ca3af" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    <span className="text-sm font-semibold text-gray-900">{entry.value}</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, background: config.color || "#9ca3af" }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
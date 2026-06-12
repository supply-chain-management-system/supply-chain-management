import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const LINE_COLORS = ["#6366f1", "#059669", "#d97706", "#dc2626", "#8b5cf6", "#ec4899"];

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
        <p style={{ fontWeight: 600, color: "#111827", marginBottom: "6px" }}>Time: {label}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ color: p.color, marginBottom: "2px", fontWeight: 500 }}>
            {p.name}: <span style={{ fontWeight: 600 }}>{p.value !== null && p.value !== undefined ? `${p.value.toFixed(1)}%` : "N/A"}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EfficiencyChart({ data, range }) {
  const isHourly = range === "today" || range === "yesterday";

  // Parse and prepare data
  let chartData = [];
  let productNames = [];

  if (isHourly) {
    // Group by hour
    const dates = Array.from(new Set((data || []).map(d => d.day.substring(0, 10)))).sort().reverse();
    const todayDate = dates[0] || "";
    const yesterdayDate = dates[1] || "";

    const hours = Array.from(new Set((data || []).map(d => d.day.substring(11, 16)))).sort();

    chartData = hours.map(h => {
      const todayRecords = (data || []).filter(d => d.day.startsWith(todayDate) && d.day.includes(h));
      const yesterdayRecords = (data || []).filter(d => d.day.startsWith(yesterdayDate) && d.day.includes(h));

      const todayAvg = todayRecords.length > 0
        ? todayRecords.reduce((sum, r) => sum + (parseFloat(r.efficiency) || 0), 0) / todayRecords.length
        : null;

      const yesterdayAvg = yesterdayRecords.length > 0
        ? yesterdayRecords.reduce((sum, r) => sum + (parseFloat(r.efficiency) || 0), 0) / yesterdayRecords.length
        : null;

      return {
        timeLabel: h,
        Today: todayAvg !== null ? todayAvg * (todayAvg <= 1.0 ? 100 : 1) : null,
        Yesterday: yesterdayAvg !== null ? yesterdayAvg * (yesterdayAvg <= 1.0 ? 100 : 1) : null,
      };
    });
  } else {
    // Group flat records by 'day'
    chartData = Object.values(
      (data || []).reduce((acc, d) => {
        const dayStr = d.day.substring(0, 10);
        if (!acc[dayStr]) {
          acc[dayStr] = { timeLabel: dayStr };
        }
        const rawEff = parseFloat(d.efficiency) || 0;
        acc[dayStr][d.product_name] = rawEff * (rawEff <= 1.0 ? 100 : 1);
        return acc;
      }, {})
    ).sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));

    // Get unique list of product names
    productNames = Array.from(new Set((data || []).map(d => d.product_name)));
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Efficiency Trends</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isHourly ? "Hourly average comparison (Yesterday vs Today)" : "Daily average efficiency trends by line"}
          </p>
        </div>
        <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200">
          Line Chart
        </span>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No efficiency trend data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="timeLabel"
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
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              {isHourly ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="Today"
                    name="Today"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="Yesterday"
                    name="Yesterday"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                </>
              ) : (
                productNames.map((name, idx) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
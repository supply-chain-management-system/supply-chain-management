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

const COLORS = ["#6366f1", "#059669", "#d97706", "#8b5cf6", "#ec4899", "#3b82f6"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: "12px",
      }}>
        <p style={{ fontWeight: 600, color: "#111827" }}>{data.name}</p>
        <p style={{ color: "#4f46e5", fontWeight: 500, marginTop: "4px" }}>
          Throughput: <span style={{ fontWeight: 600 }}>{data.totalThroughput.toLocaleString()} units</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function WorkerThroughputChart({ data }) {
  // Robust mapping and aggregation to ensure accurate representation
  const processedData = (data || []).map(w => ({
    name: w.name || `Worker #${w.id}`,
    totalThroughput: w.totalThroughput !== undefined ? w.totalThroughput : (w.throughput || 0),
  }));

  const grouped = Object.values(
    processedData.reduce((acc, curr) => {
      if (!acc[curr.name]) {
        acc[curr.name] = { name: curr.name, totalThroughput: 0 };
      }
      acc[curr.name].totalThroughput += curr.totalThroughput;
      return acc;
    }, {})
  );

  // Sort descending to show top performers first
  const sortedWorkers = grouped.sort((a, b) => b.totalThroughput - a.totalThroughput);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Worker Throughput</h3>
          <p className="text-xs text-gray-500 mt-0.5">Total produced units by worker over period</p>
        </div>
        <span className="text-xs text-gray-400 font-medium bg-white px-2.5 py-1 rounded-lg border border-gray-200">
          Throughput Bar
        </span>
      </div>

      {sortedWorkers.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-xs text-gray-400">
          No worker throughput data available.
        </div>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedWorkers}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalThroughput" radius={[0, 4, 4, 0]} barSize={16}>
                {sortedWorkers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

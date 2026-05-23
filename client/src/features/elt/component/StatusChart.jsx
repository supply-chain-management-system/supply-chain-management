import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function StatusChart({ data }) {
  const grouped = Object.values(
    data.reduce((acc, item) => {
      acc[item.status] = acc[item.status] || {
        name: item.status,
        value: 0
      };
      acc[item.status].value++;
      return acc;
    }, {})
  );

  const COLORS = ["#f59e0b", "#10b981", "#ef4444"];

  return (
    <div className="h-80 bg-gray-900 p-3 rounded">
      <h3 className="mb-2">Status</h3>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={grouped} dataKey="value" outerRadius={100}>
            {grouped.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}